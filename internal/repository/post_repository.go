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

// SearchPosts searches posts with filters, pagination, and sorting
// Returns posts and total count
func (r *PostRepository) SearchPosts(ctx context.Context, filters dto.PostFilters) ([]*model.Post, int64, error) {
	// Build WHERE conditions and arguments
	whereConditions := []string{}
	args := []interface{}{}

	// Base condition: only public posts (unless filtering by user_id)
	// If UserID is set, allow private posts (user can see their own posts)
	if filters.UserID != nil {
		whereConditions = append(whereConditions, "user_id = ?")
		args = append(args, *filters.UserID)
	} else {
		whereConditions = append(whereConditions, "is_public = 1")
	}

	// Text search in title and body
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		whereConditions = append(whereConditions, "(title LIKE ? OR body LIKE ?)")
		args = append(args, searchPattern, searchPattern)
	}

	// Category filter
	if len(filters.Category) > 0 {
		placeholders := make([]string, len(filters.Category))
		for i := range filters.Category {
			placeholders[i] = "?"
			args = append(args, filters.Category[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("category IN (%s)", strings.Join(placeholders, ",")))
	}

	// iRating range
	if filters.MinIRating != nil {
		whereConditions = append(whereConditions, "min_irating >= ?")
		args = append(args, *filters.MinIRating)
	}
	if filters.MaxIRating != nil {
		whereConditions = append(whereConditions, "min_irating <= ?")
		args = append(args, *filters.MaxIRating)
	}

	// License level filter
	if filters.MinLicenseLevel != "" {
		// License levels: R < D < C < B < A < P
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
				whereConditions = append(whereConditions, fmt.Sprintf("min_license_level IN (%s)", strings.Join(placeholders, ",")))
			}
		}
	}

	// Series filter
	if len(filters.SeriesIDs) > 0 {
		placeholders := make([]string, len(filters.SeriesIDs))
		for i := range filters.SeriesIDs {
			placeholders[i] = "?"
			args = append(args, filters.SeriesIDs[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("series_id IN (%s)", strings.Join(placeholders, ",")))
	}

	// Track filter
	if len(filters.TrackIDs) > 0 {
		placeholders := make([]string, len(filters.TrackIDs))
		for i := range filters.TrackIDs {
			placeholders[i] = "?"
			args = append(args, filters.TrackIDs[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("track_id IN (%s)", strings.Join(placeholders, ",")))
	}

	// Timezone filter
	if filters.Timezone != "" {
		whereConditions = append(whereConditions, "timezone = ?")
		args = append(args, filters.Timezone)
	}

	// Status filter
	if len(filters.Status) > 0 {
		placeholders := make([]string, len(filters.Status))
		for i := range filters.Status {
			placeholders[i] = "?"
			args = append(args, filters.Status[i])
		}
		whereConditions = append(whereConditions, fmt.Sprintf("status IN (%s)", strings.Join(placeholders, ",")))
	} else if filters.UserID == nil {
		// Default: only open posts for public listing (no status filter and no user filter)
		whereConditions = append(whereConditions, "status = 'open'")
	}

	// Event date range
	if filters.EventStartFrom != nil {
		whereConditions = append(whereConditions, "event_start_at >= ?")
		args = append(args, *filters.EventStartFrom)
	}
	if filters.EventStartTo != nil {
		whereConditions = append(whereConditions, "event_start_at <= ?")
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
		// Need DISTINCT to avoid duplicates when joining with post_cars
	}

	// Build ORDER BY clause
	orderBy := "ORDER BY created_at DESC"
	if filters.SortBy != "" {
		validSortFields := map[string]string{
			"created_at":     "created_at",
			"event_start_at": "event_start_at",
			"min_irating":    "min_irating",
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
	if len(filters.CarIDs) > 0 {
		selectClause = strings.Replace(selectClause, "SELECT", "SELECT DISTINCT", 1)
	}

	// Get total count first (before adding pagination args)
	countDistinct := ""
	if len(filters.CarIDs) > 0 {
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
