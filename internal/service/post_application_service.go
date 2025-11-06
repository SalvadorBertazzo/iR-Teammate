package service

import (
	"context"
	"fmt"
	"iR-Teammate/internal/dto"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
	"time"
)

type PostApplicationService struct {
	appRepo  *repository.PostApplicationRepository
	postRepo *repository.PostRepository
	userRepo *repository.UserRepository
}

func NewPostApplicationService(
	appRepo *repository.PostApplicationRepository,
	postRepo *repository.PostRepository,
	userRepo *repository.UserRepository,
) *PostApplicationService {
	return &PostApplicationService{
		appRepo:  appRepo,
		postRepo: postRepo,
		userRepo: userRepo,
	}
}

// CreateApplication creates a new application to a post
// Validates: post exists, post is open, user is not the owner, no duplicate application
func (s *PostApplicationService) CreateApplication(ctx context.Context, postID int64, applicantID int64, message string) (*dto.PostApplicationDTO, error) {
	// Validate post exists
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return nil, ErrPostNotFound
	}

	// Validate post is open
	if post.Status != "open" {
		return nil, ErrPostNotOpen
	}

	// Validate user is not the owner
	if post.UserID == applicantID {
		return nil, ErrCannotApplyToOwnPost
	}

	// Check if application already exists
	existing, err := s.appRepo.GetByPostAndApplicant(ctx, postID, applicantID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing application: %w", err)
	}
	if existing != nil {
		return nil, ErrApplicationAlreadyExists
	}

	// Create application
	app := &model.PostApplication{
		PostID:      postID,
		ApplicantID: applicantID,
		Status:      "pending",
		Message:     message,
	}

	id, err := s.appRepo.Create(ctx, app)
	if err != nil {
		return nil, fmt.Errorf("failed to create application: %w", err)
	}

	app.ID = id
	app.CreatedAt = time.Now().UTC()
	app.UpdatedAt = time.Now().UTC()

	return s.buildDTO(ctx, app, nil)
}

// GetApplicationByID returns an application by ID
func (s *PostApplicationService) GetApplicationByID(ctx context.Context, id int64, expand map[string]bool) (*dto.PostApplicationDTO, error) {
	app, err := s.appRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get application: %w", err)
	}
	if app == nil {
		return nil, nil
	}
	return s.buildDTO(ctx, app, expand)
}

// ListByPost returns all applications for a post (only owner can see)
func (s *PostApplicationService) ListByPost(ctx context.Context, postID int64, userID int64, expand map[string]bool) ([]*dto.PostApplicationDTO, error) {
	// Validate post exists and user is owner
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return nil, ErrPostNotFound
	}
	if post.UserID != userID {
		return nil, ErrForbidden
	}

	apps, err := s.appRepo.ListByPost(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to list applications: %w", err)
	}

	result := make([]*dto.PostApplicationDTO, 0, len(apps))
	for _, app := range apps {
		dtoItem, buildErr := s.buildDTO(ctx, app, expand)
		if buildErr != nil {
			return nil, buildErr
		}
		result = append(result, dtoItem)
	}
	return result, nil
}

// ListByPostAndStatus returns applications for a post filtered by status (only owner can see)
func (s *PostApplicationService) ListByPostAndStatus(ctx context.Context, postID int64, status string, userID int64, expand map[string]bool) ([]*dto.PostApplicationDTO, error) {
	// Validate status
	if status != "pending" && status != "accepted" && status != "rejected" {
		return nil, fmt.Errorf("invalid status: %s", status)
	}

	// Validate post exists and user is owner
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return nil, ErrPostNotFound
	}
	if post.UserID != userID {
		return nil, ErrForbidden
	}

	apps, err := s.appRepo.ListByPostAndStatus(ctx, postID, status)
	if err != nil {
		return nil, fmt.Errorf("failed to list applications: %w", err)
	}

	result := make([]*dto.PostApplicationDTO, 0, len(apps))
	for _, app := range apps {
		dtoItem, buildErr := s.buildDTO(ctx, app, expand)
		if buildErr != nil {
			return nil, buildErr
		}
		result = append(result, dtoItem)
	}
	return result, nil
}

// ListByApplicant returns all applications made by a user
func (s *PostApplicationService) ListByApplicant(ctx context.Context, applicantID int64, expand map[string]bool) ([]*dto.PostApplicationDTO, error) {
	apps, err := s.appRepo.ListByApplicant(ctx, applicantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list applications: %w", err)
	}

	result := make([]*dto.PostApplicationDTO, 0, len(apps))
	for _, app := range apps {
		dtoItem, buildErr := s.buildDTO(ctx, app, expand)
		if buildErr != nil {
			return nil, buildErr
		}
		result = append(result, dtoItem)
	}
	return result, nil
}

// UpdateStatus updates the status of an application (accept/reject)
// Only the post owner can update status, and only pending applications can be updated
func (s *PostApplicationService) UpdateStatus(ctx context.Context, id int64, status string, userID int64) (*dto.PostApplicationDTO, error) {
	// Validate status
	if status != "accepted" && status != "rejected" {
		return nil, fmt.Errorf("invalid status: %s (must be 'accepted' or 'rejected')", status)
	}

	// Get application
	app, err := s.appRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get application: %w", err)
	}
	if app == nil {
		return nil, ErrApplicationNotFound
	}

	// Validate application is pending
	if app.Status != "pending" {
		return nil, ErrApplicationNotPending
	}

	// Validate post exists and user is owner
	post, err := s.postRepo.GetByID(ctx, app.PostID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return nil, ErrPostNotFound
	}
	if post.UserID != userID {
		return nil, ErrForbidden
	}

	// Update status
	if err := s.appRepo.UpdateStatus(ctx, id, status); err != nil {
		return nil, fmt.Errorf("failed to update application status: %w", err)
	}

	// Get updated application
	updatedApp, err := s.appRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated application: %w", err)
	}

	return s.buildDTO(ctx, updatedApp, nil)
}

// CountByPostAndStatus returns the count of applications for a post by status
func (s *PostApplicationService) CountByPostAndStatus(ctx context.Context, postID int64, status string) (int64, error) {
	count, err := s.appRepo.CountByPostAndStatus(ctx, postID, status)
	if err != nil {
		return 0, fmt.Errorf("failed to count applications: %w", err)
	}
	return count, nil
}

// buildDTO builds the PostApplicationDTO with expand support
func (s *PostApplicationService) buildDTO(ctx context.Context, app *model.PostApplication, expand map[string]bool) (*dto.PostApplicationDTO, error) {
	if app == nil {
		return nil, fmt.Errorf("application is nil")
	}

	var createdAtStr string
	if !app.CreatedAt.IsZero() {
		createdAtStr = app.CreatedAt.UTC().Format(time.RFC3339Nano)
	}

	var updatedAtStr string
	if !app.UpdatedAt.IsZero() {
		updatedAtStr = app.UpdatedAt.UTC().Format(time.RFC3339Nano)
	}

	dtoItem := &dto.PostApplicationDTO{
		ID:          app.ID,
		PostID:      app.PostID,
		ApplicantID: app.ApplicantID,
		Status:      app.Status,
		Message:     app.Message,
		CreatedAt:   createdAtStr,
		UpdatedAt:   updatedAtStr,
	}

	// Only build included block if expand is requested
	if len(expand) > 0 {
		included := &dto.PostApplicationIncludedDTO{}

		// Expand applicant
		if expand["applicant"] && s.userRepo != nil {
			user, err := s.userRepo.GetByID(ctx, app.ApplicantID)
			if err != nil {
				return nil, fmt.Errorf("failed to get applicant: %w", err)
			}
			if user != nil {
				included.Applicant = &dto.UserMinDTO{
					ID:       user.ID,
					Username: user.Username,
				}
			}
		}

		// Expand post
		if expand["post"] && s.postRepo != nil {
			post, err := s.postRepo.GetByID(ctx, app.PostID)
			if err != nil {
				return nil, fmt.Errorf("failed to get post: %w", err)
			}
			if post != nil {
				// Build minimal post DTO (without full expand)
				included.Post = &dto.PostDTO{
					ID:        post.ID,
					UserID:    post.UserID,
					Title:     post.Title,
					Body:      post.Body,
					Category:  post.Category,
					Status:    post.Status,
					IsPublic:  post.IsPublic,
					CreatedAt: post.CreatedAt,
					UpdatedAt: post.UpdatedAt,
				}
			}
		}

		// Only set included if at least one relation was expanded
		if included.Applicant != nil || included.Post != nil {
			dtoItem.Included = included
		}
	}

	return dtoItem, nil
}

// Error definitions
var (
	ErrPostNotFound             = Err("post not found")
	ErrPostNotOpen              = Err("post is not open")
	ErrCannotApplyToOwnPost     = Err("cannot apply to own post")
	ErrApplicationAlreadyExists = Err("application already exists")
	ErrApplicationNotFound      = Err("application not found")
	ErrApplicationNotPending    = Err("application is not pending")
	ErrForbidden                = Err("forbidden")
)
