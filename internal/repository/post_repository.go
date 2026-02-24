package repository

import (
	"context"
	"database/sql"
	"fmt"
	"iR-Teammate/internal/dto"
	"iR-Teammate/internal/model"
	"strings"

	"github.com/jmoiron/sqlx"
)

type PostRepository struct {
	db *sqlx.DB
}

func NewPostRepository(db *sqlx.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) Create(ctx context.Context, p *model.Post) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO posts (
			user_id, title, body,
			event_id, series_id, car_class_id, track_id,
			category, min_license_level, min_irating,
			timezone, event_start_at,
			slots_total, status, is_public, contact_hint
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		p.UserID, p.Title, p.Body,
		p.EventID, p.SeriesID, p.CarClassID, p.TrackID,
		p.Category, p.MinLicenseLevel, p.MinIRating,
		p.Timezone, p.EventStartAt,
		p.SlotsTotal, p.Status, p.IsPublic, p.ContactHint,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *PostRepository) GetByID(ctx context.Context, id int64) (*model.Post, error) {
	var p model.Post
	err := r.db.GetContext(ctx, &p, `
		SELECT
			id, user_id, title, body,
			event_id, series_id, car_class_id, track_id,
			category, min_license_level, min_irating,
			timezone, event_start_at,
			slots_total, status, is_public, contact_hint,
			created_at, updated_at
		FROM posts
		WHERE id = ?
	`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) Update(ctx context.Context, p *model.Post) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE posts
		SET
			title = ?,
			body = ?,
			event_id = ?,
			series_id = ?,
			car_class_id = ?,
			track_id = ?,
			category = ?,
			min_license_level = ?,
			min_irating = ?,
			timezone = ?,
			event_start_at = ?,
			slots_total = ?,
			status = ?,
			is_public = ?,
			contact_hint = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`,
		p.Title,
		p.Body,
		p.EventID,
		p.SeriesID,
		p.CarClassID,
		p.TrackID,
		p.Category,
		p.MinLicenseLevel,
		p.MinIRating,
		p.Timezone,
		p.EventStartAt,
		p.SlotsTotal,
		p.Status,
		p.IsPublic,
		p.ContactHint,
		p.ID,
	)
	return err
}

func (r *PostRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM posts WHERE id = ?`, id)
	return err
}

// ListByUser returns all posts owned by a user, ordered newest first
func (r *PostRepository) ListByUser(ctx context.Context, userID int64) ([]*model.Post, error) {
	var posts []*model.Post
	err := r.db.SelectContext(ctx, &posts, `
		SELECT id, user_id, title, body,
		       event_id, series_id, car_class_id, track_id,
		       category, min_license_level, min_irating,
		       timezone, event_start_at,
		       slots_total, status, is_public, contact_hint,
		       created_at, updated_at
		FROM posts
		WHERE user_id = ?
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	return posts, nil
}

// SearchPosts searches posts with filters, pagination, and sorting
// Returns posts and total count
func (r *PostRepository) SearchPosts(ctx context.Context, filters dto.PostFilters) ([]*model.Post, int64, error) {
	whereConditions := []string{}
	args := []interface{}{}
	needDistinct := false

	// Base condition: only public posts (unless filtering by user_id)
	if filters.UserID != nil {
		whereConditions = append(whereConditions, "posts.user_id = ?")
		args = append(args, *filters.UserID)
	} else {
		whereConditions = append(whereConditions, "posts.is_public = 1")
	}

	// Text search in title and body
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		whereConditions = append(whereConditions, "(posts.title LIKE ? OR posts.body LIKE ?)")
		args = append(args, searchPattern, searchPattern)
	}

	// Category filter (via junction table)
	if len(filters.Category) > 0 {
		placeholders := make([]string, len(filters.Category))
		for i := range filters.Category {
			placeholders[i] = "?"
			args = append(args, filters.Category[i])
		}
		whereConditions = append(whereConditions,
			fmt.Sprintf("posts.id IN (SELECT post_id FROM post_categories WHERE category IN (%s))",
				strings.Join(placeholders, ",")))
	}

	// iRating range
	if filters.MinIRating != nil {
		whereConditions = append(whereConditions, "posts.min_irating >= ?")
		args = append(args, *filters.MinIRating)
	}
	if filters.MaxIRating != nil {
		whereConditions = append(whereConditions, "posts.min_irating <= ?")
		args = append(args, *filters.MaxIRating)
	}

	// License level filter
	if filters.MinLicenseLevel != "" {
		licenseOrder := map[string]int{"R": 0, "D": 1, "C": 2, "B": 3, "A": 4, "P": 5}
		minLevel, ok := licenseOrder[filters.MinLicenseLevel]
		if ok {
			validLevels := []string{}
			for level, order := range licenseOrder {
				if order >= minLevel {
					validLevels = append(validLevels, level)
				}
			}
			if len(validLevels) > 0 {
				placeholders := make([]string, len(validLevels))
				for i := range validLevels {
					placeholders[i] = "?"
					args = append(args, validLevels[i])
				}
				whereConditions = append(whereConditions, fmt.Sprintf("posts.min_license_level IN (%s)", strings.Join(placeholders, ",")))
			}
		}
	}

	// License levels filter (multi-select, exact match)
	if len(filters.LicenseLevels) > 0 {
		placeholders := make([]string, len(filters.LicenseLevels))
		for i := range filters.LicenseLevels {
			placeholders[i] = "?"
			args = append(args, filters.LicenseLevels[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("posts.min_license_level IN (%s)", strings.Join(placeholders, ",")))
	}

	// Series filter (via junction table)
	if len(filters.SeriesIDs) > 0 {
		placeholders := make([]string, len(filters.SeriesIDs))
		for i := range filters.SeriesIDs {
			placeholders[i] = "?"
			args = append(args, filters.SeriesIDs[i])
		}
		whereConditions = append(whereConditions,
			fmt.Sprintf("posts.id IN (SELECT post_id FROM post_series WHERE series_id IN (%s))",
				strings.Join(placeholders, ",")))
	}

	// Car Class filter (via junction table)
	if len(filters.CarClassIDs) > 0 {
		placeholders := make([]string, len(filters.CarClassIDs))
		for i := range filters.CarClassIDs {
			placeholders[i] = "?"
			args = append(args, filters.CarClassIDs[i])
		}
		whereConditions = append(whereConditions,
			fmt.Sprintf("posts.id IN (SELECT post_id FROM post_car_classes WHERE car_class_id IN (%s))",
				strings.Join(placeholders, ",")))
	}

	// Track filter (via junction table)
	if len(filters.TrackIDs) > 0 {
		placeholders := make([]string, len(filters.TrackIDs))
		for i := range filters.TrackIDs {
			placeholders[i] = "?"
			args = append(args, filters.TrackIDs[i])
		}
		whereConditions = append(whereConditions,
			fmt.Sprintf("posts.id IN (SELECT post_id FROM post_tracks WHERE track_id IN (%s))",
				strings.Join(placeholders, ",")))
	}

	// Language filter (via junction table)
	if len(filters.LanguageCodes) > 0 {
		placeholders := make([]string, len(filters.LanguageCodes))
		for i := range filters.LanguageCodes {
			placeholders[i] = "?"
			args = append(args, filters.LanguageCodes[i])
		}
		whereConditions = append(whereConditions,
			fmt.Sprintf("posts.id IN (SELECT post_id FROM post_languages WHERE language_code IN (%s))",
				strings.Join(placeholders, ",")))
	}

	// Event IDs filter
	if len(filters.EventIDs) > 0 {
		placeholders := make([]string, len(filters.EventIDs))
		for i := range filters.EventIDs {
			placeholders[i] = "?"
			args = append(args, filters.EventIDs[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("posts.event_id IN (%s)", strings.Join(placeholders, ",")))
	}

	// Has event filter
	if filters.HasEvent != nil {
		if *filters.HasEvent {
			whereConditions = append(whereConditions, "posts.event_id IS NOT NULL")
		} else {
			whereConditions = append(whereConditions, "posts.event_id IS NULL")
		}
	}

	// Timezone filter
	if filters.Timezone != "" {
		whereConditions = append(whereConditions, "posts.timezone = ?")
		args = append(args, filters.Timezone)
	}

	// Status filter
	if len(filters.Status) > 0 {
		placeholders := make([]string, len(filters.Status))
		for i := range filters.Status {
			placeholders[i] = "?"
			args = append(args, filters.Status[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("posts.status IN (%s)", strings.Join(placeholders, ",")))
	} else if filters.UserID == nil {
		whereConditions = append(whereConditions, "posts.status = 'open'")
	}

	// Event date range
	if filters.EventStartFrom != nil {
		whereConditions = append(whereConditions, "posts.event_start_at >= ?")
		args = append(args, *filters.EventStartFrom)
	}
	if filters.EventStartTo != nil {
		whereConditions = append(whereConditions, "posts.event_start_at <= ?")
		args = append(args, *filters.EventStartTo)
	}

	// Build WHERE clause
	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Handle car filter with JOIN
	joinClause := ""
	if len(filters.CarIDs) > 0 {
		joinClause = "INNER JOIN post_cars ON posts.id = post_cars.post_id"
		carPlaceholders := make([]string, len(filters.CarIDs))
		for i := range filters.CarIDs {
			carPlaceholders[i] = "?"
			args = append(args, filters.CarIDs[i])
		}
		if whereClause == "" {
			whereClause = "WHERE "
		} else {
			whereClause += " AND "
		}
		whereClause += fmt.Sprintf("post_cars.car_id IN (%s)", strings.Join(carPlaceholders, ","))
		needDistinct = true
	}

	// Build ORDER BY clause
	orderBy := "ORDER BY posts.created_at DESC"
	if filters.SortBy != "" {
		validSortFields := map[string]string{
			"created_at":     "posts.created_at",
			"event_start_at": "posts.event_start_at",
			"min_irating":    "posts.min_irating",
		}
		if sortField, ok := validSortFields[filters.SortBy]; ok {
			sortOrder := "DESC"
			if filters.SortOrder == "asc" {
				sortOrder = "ASC"
			}
			orderBy = fmt.Sprintf("ORDER BY %s %s", sortField, sortOrder)
		}
	}

	// Build pagination
	limit := 20
	if filters.Limit > 0 {
		if filters.Limit > 100 {
			limit = 100
		} else {
			limit = filters.Limit
		}
	}
	offset := 0
	if filters.Offset > 0 {
		offset = filters.Offset
	}

	// Build SELECT clause
	selectClause := `
		SELECT
			posts.id, posts.user_id, posts.title, posts.body,
			posts.event_id, posts.series_id, posts.car_class_id, posts.track_id,
			posts.category, posts.min_license_level, posts.min_irating,
			posts.timezone, posts.event_start_at,
			posts.slots_total, posts.status, posts.is_public, posts.contact_hint,
			posts.created_at, posts.updated_at
	`
	if needDistinct {
		selectClause = strings.Replace(selectClause, "SELECT", "SELECT DISTINCT", 1)
	}

	// Get total count first (before adding pagination args)
	countDistinct := ""
	if needDistinct {
		countDistinct = "DISTINCT "
	}
	countQuery := fmt.Sprintf(`
		SELECT COUNT(%sposts.id)
		FROM posts
		%s
		%s
	`, countDistinct, joinClause, whereClause)

	var total int64
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	// Build full query for posts with pagination
	query := fmt.Sprintf(`
		%s
		FROM posts
		%s
		%s
		%s
		LIMIT ? OFFSET ?
	`, selectClause, joinClause, whereClause, orderBy)

	// Add pagination args
	args = append(args, limit, offset)

	// Execute query
	var items []*model.Post
	if err := r.db.SelectContext(ctx, &items, query, args...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}
