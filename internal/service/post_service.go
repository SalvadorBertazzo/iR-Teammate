package service

import (
	"context"
	"fmt"
	"iR-Teammate/internal/dto"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
)

type PostService struct {
	postRepo     *repository.PostRepository
	postCarRepo  *repository.PostCarRepository
	postLangRepo *repository.PostLanguageRepository

	// Catalog repositories used to expand DTOs
	seriesRepo   *repository.SeriesRepository
	carClassRepo *repository.CarClassRepository
	carRepo      *repository.CarRepository
	eventRepo    *repository.EventRepository
	trackRepo    *repository.TrackRepository
	// For resolving language names from codes
	userLangRepo *repository.UserLanguageRepository
}

func NewPostService(
	postRepo *repository.PostRepository,
	postCarRepo *repository.PostCarRepository,
	postLangRepo *repository.PostLanguageRepository,
	seriesRepo *repository.SeriesRepository,
	carClassRepo *repository.CarClassRepository,
	carRepo *repository.CarRepository,
	eventRepo *repository.EventRepository,
	trackRepo *repository.TrackRepository,
	userLangRepo *repository.UserLanguageRepository,
) *PostService {
	return &PostService{
		postRepo:     postRepo,
		postCarRepo:  postCarRepo,
		postLangRepo: postLangRepo,
		seriesRepo:   seriesRepo,
		carClassRepo: carClassRepo,
		carRepo:      carRepo,
		eventRepo:    eventRepo,
		trackRepo:    trackRepo,
		userLangRepo: userLangRepo,
	}
}

// CreatePost creates a post and replaces its N:M relations (cars, languages)
// It assumes FK constraints will enforce the existence of referenced IDs.
func (s *PostService) CreatePost(ctx context.Context, userID int64, post *model.Post, carIDs []int64, languageCodes []string) (*model.Post, error) {
	if post == nil {
		return nil, fmt.Errorf("post is required")
	}
	post.UserID = userID

	// Basic category validation (mirrors DB CHECK)
	if err := s.validateCategory(post.Category); err != nil {
		return nil, err
	}

	id, err := s.postRepo.Create(ctx, post)
	if err != nil {
		return nil, err
	}
	post.ID = id

	// Upsert relations (replace full set)
	if err := s.postCarRepo.UpsertForPost(ctx, post.ID, carIDs); err != nil {
		return nil, err
	}
	if err := s.postLangRepo.UpsertForPost(ctx, post.ID, languageCodes); err != nil {
		return nil, err
	}

	// Return the freshly created post (without joins)
	return post, nil
}

// UpdatePost updates a post (ownership required) and replaces cars/languages sets
func (s *PostService) UpdatePost(ctx context.Context, userID int64, post *model.Post, carIDs []int64, languageCodes []string) (*model.Post, error) {
	if post == nil || post.ID == 0 {
		return nil, fmt.Errorf("post id is required")
	}

	existing, err := s.postRepo.GetByID(ctx, post.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, fmt.Errorf("post not found")
	}
	if existing.UserID != userID {
		return nil, fmt.Errorf("forbidden: not the owner")
	}

	// Optional: validate category if provided/changed
	if post.Category != "" {
		if err := s.validateCategory(post.Category); err != nil {
			return nil, err
		}
	}

	// Persist main post update
	if err := s.postRepo.Update(ctx, post); err != nil {
		return nil, err
	}

	// Replace relations
	if carIDs != nil {
		if err := s.postCarRepo.UpsertForPost(ctx, post.ID, carIDs); err != nil {
			return nil, err
		}
	}
	if languageCodes != nil {
		if err := s.postLangRepo.UpsertForPost(ctx, post.ID, languageCodes); err != nil {
			return nil, err
		}
	}

	// Fetch updated
	updated, err := s.postRepo.GetByID(ctx, post.ID)
	if err != nil {
		return nil, err
	}
	return updated, nil
}

// validateCategory ensures the category matches allowed values (mirrors DB CHECK)
func (s *PostService) validateCategory(category string) error {
	switch category {
	case "sports_car", "formula", "oval", "dirt_road", "dirt_oval":
		return nil
	default:
		return fmt.Errorf("invalid category: %s", category)
	}
}

// validateFilters validates and normalizes filter criteria
func (s *PostService) validateFilters(filters *dto.PostFilters) error {
	// Validate UserID
	if filters.UserID != nil && *filters.UserID <= 0 {
		return fmt.Errorf("invalid user_id: must be greater than 0")
	}

	// Validate categories
	validCategories := map[string]bool{
		"sports_car": true,
		"formula":    true,
		"oval":       true,
		"dirt_road":  true,
		"dirt_oval":  true,
	}
	for _, cat := range filters.Category {
		if !validCategories[cat] {
			return fmt.Errorf("invalid category: %s", cat)
		}
	}

	// Validate status
	validStatuses := map[string]bool{
		"open":      true,
		"filled":    true,
		"closed":    true,
		"cancelled": true,
	}
	for _, status := range filters.Status {
		if !validStatuses[status] {
			return fmt.Errorf("invalid status: %s", status)
		}
	}

	// Validate sort_by
	if filters.SortBy != "" {
		validSortFields := map[string]bool{
			"created_at":     true,
			"event_start_at": true,
			"min_irating":    true,
		}
		if !validSortFields[filters.SortBy] {
			return fmt.Errorf("invalid sort_by: %s", filters.SortBy)
		}
	}

	// Validate sort_order
	if filters.SortOrder != "" && filters.SortOrder != "asc" && filters.SortOrder != "desc" {
		return fmt.Errorf("invalid sort_order: %s (must be 'asc' or 'desc')", filters.SortOrder)
	}

	// Validate license level
	if filters.MinLicenseLevel != "" {
		validLicenseLevels := map[string]bool{
			"R": true, "D": true, "C": true, "B": true, "A": true, "P": true,
		}
		if !validLicenseLevels[filters.MinLicenseLevel] {
			return fmt.Errorf("invalid min_license_level: %s", filters.MinLicenseLevel)
		}
	}

	// Validate iRating range
	if filters.MinIRating != nil && filters.MaxIRating != nil {
		if *filters.MinIRating > *filters.MaxIRating {
			return fmt.Errorf("min_irating (%d) cannot be greater than max_irating (%d)", *filters.MinIRating, *filters.MaxIRating)
		}
	}
	if filters.MinIRating != nil && *filters.MinIRating < 0 {
		return fmt.Errorf("min_irating cannot be negative")
	}
	if filters.MaxIRating != nil && *filters.MaxIRating < 0 {
		return fmt.Errorf("max_irating cannot be negative")
	}

	// Validate date range
	if filters.EventStartFrom != nil && filters.EventStartTo != nil {
		if filters.EventStartFrom.After(*filters.EventStartTo) {
			return fmt.Errorf("event_start_from cannot be after event_start_to")
		}
	}

	return nil
}

// DeletePost removes a post if the requester is the owner
func (s *PostService) DeletePost(ctx context.Context, userID, postID int64) error {
	if postID <= 0 {
		return fmt.Errorf("invalid post id")
	}
	existing, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return err
	}
	if existing == nil {
		return fmt.Errorf("post not found")
	}
	if existing.UserID != userID {
		return fmt.Errorf("forbidden: not the owner")
	}
	// N:M relations are set to cascade on delete
	return s.postRepo.Delete(ctx, postID)
}

// -------------------- DTO variants (public API) --------------------

// GetPostDTO returns a PostDTO with expanded relations (if expand is requested)
func (s *PostService) GetPostDTO(ctx context.Context, postID int64, expand map[string]bool) (*dto.PostDTO, error) {
	if postID <= 0 {
		return nil, fmt.Errorf("invalid post id")
	}
	p, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, nil
	}
	return s.buildPostDTO(ctx, p, expand)
}

// SearchPostsDTO searches posts with filters and returns DTOs with pagination metadata
func (s *PostService) SearchPostsDTO(ctx context.Context, filters dto.PostFilters, expand map[string]bool) (*dto.PostSearchResponse, error) {
	// Validate and normalize filters
	if err := s.validateFilters(&filters); err != nil {
		return nil, err
	}

	// Apply default pagination if not set
	if filters.Limit <= 0 {
		filters.Limit = 20
	}
	if filters.Limit > 100 {
		filters.Limit = 100
	}
	if filters.Offset < 0 {
		filters.Offset = 0
	}

	// Search posts in repository
	posts, total, err := s.postRepo.SearchPosts(ctx, filters)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	dtos := make([]*dto.PostDTO, 0, len(posts))
	for _, p := range posts {
		d, derr := s.buildPostDTO(ctx, p, expand)
		if derr != nil {
			return nil, derr
		}
		dtos = append(dtos, d)
	}

	return &dto.PostSearchResponse{
		Posts:  dtos,
		Total:  total,
		Limit:  filters.Limit,
		Offset: filters.Offset,
	}, nil
}

// -------------------- Helpers --------------------

func (s *PostService) buildPostDTO(ctx context.Context, p *model.Post, expand map[string]bool) (*dto.PostDTO, error) {
	if p == nil {
		return nil, fmt.Errorf("post is nil")
	}
	d := &dto.PostDTO{
		ID:              p.ID,
		UserID:          p.UserID,
		Title:           p.Title,
		Body:            p.Body,
		EventID:         p.EventID,
		SeriesID:        p.SeriesID,
		CarClassID:      p.CarClassID,
		TrackID:         p.TrackID,
		Category:        p.Category,
		MinLicenseLevel: p.MinLicenseLevel,
		MinIRating:      p.MinIRating,
		Timezone:        p.Timezone,
		EventStartAt:    p.EventStartAt,
		SlotsTotal:      p.SlotsTotal,
		Status:          p.Status,
		IsPublic:        p.IsPublic,
		ContactHint:     p.ContactHint,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}

	// Always fetch car_ids and language_codes (N:M relations)
	if s.postCarRepo != nil {
		carRels, err := s.postCarRepo.GetByPostID(ctx, p.ID)
		if err != nil {
			return nil, err
		}
		if len(carRels) > 0 {
			carIDs := make([]int64, 0, len(carRels))
			for _, r := range carRels {
				carIDs = append(carIDs, r.CarID)
			}
			d.CarIDs = carIDs
		}
	}
	if s.postLangRepo != nil {
		langRels, err := s.postLangRepo.GetByPostID(ctx, p.ID)
		if err != nil {
			return nil, err
		}
		if len(langRels) > 0 {
			langCodes := make([]string, 0, len(langRels))
			for _, r := range langRels {
				langCodes = append(langCodes, r.LanguageCode)
			}
			d.LanguageCodes = langCodes
		}
	}

	// Only build included block if expand is requested
	if len(expand) > 0 {
		included := &dto.PostIncludedDTO{}

		// Expand event
		if expand["event"] && p.EventID != nil && s.eventRepo != nil {
			item, err := s.eventRepo.GetByID(ctx, *p.EventID)
			if err != nil {
				return nil, err
			}
			included.Event = item
		}

		// Expand series
		if expand["series"] && p.SeriesID != nil && s.seriesRepo != nil {
			item, err := s.seriesRepo.GetByID(ctx, *p.SeriesID)
			if err != nil {
				return nil, err
			}
			included.Series = item
		}

		// Expand car_class
		if expand["car_class"] && p.CarClassID != nil && s.carClassRepo != nil {
			item, err := s.carClassRepo.GetByID(ctx, *p.CarClassID)
			if err != nil {
				return nil, err
			}
			included.CarClass = item
		}

		// Expand track
		if expand["track"] && p.TrackID != nil && s.trackRepo != nil {
			item, err := s.trackRepo.GetByID(ctx, *p.TrackID)
			if err != nil {
				return nil, err
			}
			included.Track = item
		}

		// Expand cars (N:M) - use already fetched car_ids
		if expand["cars"] && s.carRepo != nil && len(d.CarIDs) > 0 {
			cars := make([]*model.Car, 0, len(d.CarIDs))
			for _, carID := range d.CarIDs {
				c, cerr := s.carRepo.GetByID(ctx, carID)
				if cerr != nil {
					return nil, cerr
				}
				if c != nil {
					cars = append(cars, c)
				}
			}
			included.Cars = cars
		}

		// Expand languages (N:M) - use already fetched language_codes
		if expand["languages"] && s.userLangRepo != nil && len(d.LanguageCodes) > 0 {
			// Build a map[code]Language from full catalog for quick lookup
			catalog, cerr := s.userLangRepo.GetAllLanguages(ctx)
			if cerr != nil {
				return nil, cerr
			}
			codeToLang := make(map[string]*model.Language, len(catalog))
			for _, l := range catalog {
				codeToLang[l.Code] = l
			}
			langs := make([]*model.Language, 0, len(d.LanguageCodes))
			for _, code := range d.LanguageCodes {
				if l, ok := codeToLang[code]; ok {
					langs = append(langs, l)
				}
			}
			included.Languages = langs
		}

		// Only set included if at least one relation was expanded
		if included.Event != nil || included.Series != nil || included.CarClass != nil ||
			included.Track != nil || len(included.Cars) > 0 || len(included.Languages) > 0 {
			d.Included = included
		}
	}

	return d, nil
}
