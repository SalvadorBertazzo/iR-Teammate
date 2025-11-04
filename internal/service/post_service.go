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

// getPost returns a post by id (no joins/DTO)
func (s *PostService) getPost(ctx context.Context, postID int64) (*model.Post, error) {
	if postID <= 0 {
		return nil, fmt.Errorf("invalid post id")
	}
	p, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, err
	}
	return p, nil
}

// listPublic returns public, open posts (no filters yet)
func (s *PostService) listPublic(ctx context.Context) ([]*model.Post, error) {
	return s.postRepo.GetPublic(ctx)
}

// listByUser returns all posts for a given owner
func (s *PostService) listByUser(ctx context.Context, userID int64) ([]*model.Post, error) {
	if userID <= 0 {
		return nil, fmt.Errorf("invalid user id")
	}
	return s.postRepo.GetByUserID(ctx, userID)
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

// GetPostDTO returns a PostDTO with expanded relations
func (s *PostService) GetPostDTO(ctx context.Context, postID int64) (*dto.PostDTO, error) {
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
	return s.buildPostDTO(ctx, p)
}

// ListPublicDTO returns public posts as DTOs
func (s *PostService) ListPublicDTO(ctx context.Context) ([]*dto.PostDTO, error) {
	posts, err := s.postRepo.GetPublic(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]*dto.PostDTO, 0, len(posts))
	for _, p := range posts {
		d, derr := s.buildPostDTO(ctx, p)
		if derr != nil {
			return nil, derr
		}
		out = append(out, d)
	}
	return out, nil
}

// ListByUserDTO returns user's posts as DTOs
func (s *PostService) ListByUserDTO(ctx context.Context, userID int64) ([]*dto.PostDTO, error) {
	if userID <= 0 {
		return nil, fmt.Errorf("invalid user id")
	}
	posts, err := s.postRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]*dto.PostDTO, 0, len(posts))
	for _, p := range posts {
		d, derr := s.buildPostDTO(ctx, p)
		if derr != nil {
			return nil, derr
		}
		out = append(out, d)
	}
	return out, nil
}

// -------------------- Helpers --------------------

func (s *PostService) buildPostDTO(ctx context.Context, p *model.Post) (*dto.PostDTO, error) {
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

	// Expand singular FKs if present
	if p.EventID != nil && s.eventRepo != nil {
		item, err := s.eventRepo.GetByID(ctx, *p.EventID)
		if err != nil {
			return nil, err
		}
		d.Event = item
	}
	if p.SeriesID != nil && s.seriesRepo != nil {
		item, err := s.seriesRepo.GetByID(ctx, *p.SeriesID)
		if err != nil {
			return nil, err
		}
		d.Series = item
	}
	if p.CarClassID != nil && s.carClassRepo != nil {
		item, err := s.carClassRepo.GetByID(ctx, *p.CarClassID)
		if err != nil {
			return nil, err
		}
		d.CarClass = item
	}
	if p.TrackID != nil && s.trackRepo != nil {
		item, err := s.trackRepo.GetByID(ctx, *p.TrackID)
		if err != nil {
			return nil, err
		}
		d.Track = item
	}

	// Expand cars (N:M)
	if s.postCarRepo != nil && s.carRepo != nil {
		rels, err := s.postCarRepo.GetByPostID(ctx, p.ID)
		if err != nil {
			return nil, err
		}
		if len(rels) > 0 {
			cars := make([]*model.Car, 0, len(rels))
			for _, r := range rels {
				c, cerr := s.carRepo.GetByID(ctx, r.CarID)
				if cerr != nil {
					return nil, cerr
				}
				if c != nil {
					cars = append(cars, c)
				}
			}
			d.Cars = cars
		}
	}

	// Expand languages (N:M) via codes -> names using languages catalog
	if s.postLangRepo != nil && s.userLangRepo != nil {
		rels, err := s.postLangRepo.GetByPostID(ctx, p.ID)
		if err != nil {
			return nil, err
		}
		if len(rels) > 0 {
			// Build a map[code]Language from full catalog for quick lookup
			catalog, cerr := s.userLangRepo.GetAllLanguages(ctx)
			if cerr != nil {
				return nil, cerr
			}
			codeToLang := make(map[string]*model.Language, len(catalog))
			for _, l := range catalog {
				codeToLang[l.Code] = l
			}
			langs := make([]*model.Language, 0, len(rels))
			for _, r := range rels {
				if l, ok := codeToLang[r.LanguageCode]; ok {
					langs = append(langs, l)
				}
			}
			d.Languages = langs
		}
	}

	return d, nil
}
