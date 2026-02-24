package service

import (
	"context"
	"fmt"
	"iR-Teammate/internal/dto"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
	"time"
)

type TeamService struct {
	teamRepo *repository.TeamRepository
	appRepo  *repository.PostApplicationRepository
	postRepo *repository.PostRepository
	userRepo *repository.UserRepository
}

func NewTeamService(
	teamRepo *repository.TeamRepository,
	appRepo *repository.PostApplicationRepository,
	postRepo *repository.PostRepository,
	userRepo *repository.UserRepository,
) *TeamService {
	return &TeamService{
		teamRepo: teamRepo,
		appRepo:  appRepo,
		postRepo: postRepo,
		userRepo: userRepo,
	}
}

// isMember checks whether userID is the post owner or an accepted applicant
func (s *TeamService) isMember(ctx context.Context, postID int64, userID int64) (bool, error) {
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return false, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return false, ErrPostNotFound
	}
	if post.UserID == userID {
		return true, nil
	}
	app, err := s.appRepo.GetByPostAndApplicant(ctx, postID, userID)
	if err != nil {
		return false, fmt.Errorf("failed to check membership: %w", err)
	}
	if app != nil && app.Status == "accepted" {
		return true, nil
	}
	return false, nil
}

// DeleteTeam deletes the post (and all related data via CASCADE). Only the owner can do this.
func (s *TeamService) DeleteTeam(ctx context.Context, postID int64, userID int64) error {
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return ErrPostNotFound
	}
	if post.UserID != userID {
		return ErrForbidden
	}
	if err := s.postRepo.Delete(ctx, postID); err != nil {
		return fmt.Errorf("failed to delete team: %w", err)
	}
	return nil
}

// RemoveMember removes a member from the team by deleting their application.
// - Owner can remove any member (except themselves).
// - A non-owner can only remove themselves (leave).
func (s *TeamService) RemoveMember(ctx context.Context, postID int64, targetUserID int64, requestingUserID int64) error {
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return ErrPostNotFound
	}

	isOwner := post.UserID == requestingUserID
	isSelf := targetUserID == requestingUserID

	if !isOwner && !isSelf {
		return ErrForbidden
	}
	// Owner cannot remove themselves via this endpoint (they'd need to delete the team)
	if isOwner && isSelf {
		return fmt.Errorf("owner cannot leave their own team; delete the team instead")
	}

	if err := s.appRepo.DeleteByPostAndApplicant(ctx, postID, targetUserID); err != nil {
		return fmt.Errorf("failed to remove member: %w", err)
	}
	return nil
}

// GetMyTeams returns all teams the user belongs to:
// - posts they own (role = "owner")
// - posts where their application was accepted (role = "member")
func (s *TeamService) GetMyTeams(ctx context.Context, userID int64) ([]*dto.MyTeamDTO, error) {
	result := make([]*dto.MyTeamDTO, 0)

	// Own posts
	ownedPosts, err := s.postRepo.ListByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list owned posts: %w", err)
	}
	for _, p := range ownedPosts {
		result = append(result, &dto.MyTeamDTO{
			PostID: p.ID,
			Title:  p.Title,
			Role:   "owner",
		})
	}

	// Accepted applications
	acceptedApps, err := s.appRepo.ListByApplicant(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list applications: %w", err)
	}
	for _, app := range acceptedApps {
		if app.Status != "accepted" {
			continue
		}
		post, err := s.postRepo.GetByID(ctx, app.PostID)
		if err != nil {
			return nil, fmt.Errorf("failed to get post: %w", err)
		}
		if post == nil {
			continue
		}
		result = append(result, &dto.MyTeamDTO{
			PostID: post.ID,
			Title:  post.Title,
			Role:   "member",
		})
	}

	return result, nil
}

// GetTeam returns the team info for a post (members + title)
func (s *TeamService) GetTeam(ctx context.Context, postID int64, userID int64) (*dto.TeamDTO, error) {
	post, err := s.postRepo.GetByID(ctx, postID)
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	if post == nil {
		return nil, ErrPostNotFound
	}

	member, err := s.isMember(ctx, postID, userID)
	if err != nil {
		return nil, err
	}
	if !member {
		return nil, ErrForbidden
	}

	// Build members list: owner first, then accepted applicants
	members := make([]*dto.TeamMemberDTO, 0)

	owner, err := s.userRepo.GetByID(ctx, post.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get owner: %w", err)
	}
	if owner != nil {
		members = append(members, &dto.TeamMemberDTO{
			UserID:   owner.ID,
			Username: owner.Username,
			Role:     "owner",
			JoinedAt: post.CreatedAt.UTC().Format(time.RFC3339),
		})
	}

	acceptedApps, err := s.appRepo.ListByPostAndStatus(ctx, postID, "accepted")
	if err != nil {
		return nil, fmt.Errorf("failed to list accepted applications: %w", err)
	}

	for _, app := range acceptedApps {
		user, err := s.userRepo.GetByID(ctx, app.ApplicantID)
		if err != nil {
			return nil, fmt.Errorf("failed to get member user: %w", err)
		}
		if user == nil {
			continue
		}
		members = append(members, &dto.TeamMemberDTO{
			UserID:   user.ID,
			Username: user.Username,
			Role:     "member",
			JoinedAt: app.UpdatedAt.UTC().Format(time.RFC3339),
		})
	}

	return &dto.TeamDTO{
		PostID:  postID,
		Title:   post.Title,
		Members: members,
	}, nil
}

// ListMessages returns chat messages for a team, optionally after a given message ID
func (s *TeamService) ListMessages(ctx context.Context, postID int64, userID int64, afterID int64) ([]*dto.TeamMessageDTO, error) {
	member, err := s.isMember(ctx, postID, userID)
	if err != nil {
		return nil, err
	}
	if !member {
		return nil, ErrForbidden
	}

	msgs, err := s.teamRepo.ListMessages(ctx, postID, afterID)
	if err != nil {
		return nil, fmt.Errorf("failed to list messages: %w", err)
	}

	result := make([]*dto.TeamMessageDTO, 0, len(msgs))
	for _, msg := range msgs {
		user, err := s.userRepo.GetByID(ctx, msg.UserID)
		if err != nil {
			return nil, fmt.Errorf("failed to get message author: %w", err)
		}
		username := ""
		if user != nil {
			username = user.Username
		}
		result = append(result, &dto.TeamMessageDTO{
			ID:        msg.ID,
			PostID:    msg.PostID,
			UserID:    msg.UserID,
			Username:  username,
			Body:      msg.Body,
			CreatedAt: msg.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

// CreateMessage sends a message in the team chat
func (s *TeamService) CreateMessage(ctx context.Context, postID int64, userID int64, body string) (*dto.TeamMessageDTO, error) {
	if body == "" {
		return nil, fmt.Errorf("message body cannot be empty")
	}

	member, err := s.isMember(ctx, postID, userID)
	if err != nil {
		return nil, err
	}
	if !member {
		return nil, ErrForbidden
	}

	msg := &model.TeamMessage{
		PostID: postID,
		UserID: userID,
		Body:   body,
	}

	id, err := s.teamRepo.CreateMessage(ctx, msg)
	if err != nil {
		return nil, fmt.Errorf("failed to create message: %w", err)
	}

	created, err := s.teamRepo.GetMessageByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get created message: %w", err)
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	username := ""
	if user != nil {
		username = user.Username
	}

	return &dto.TeamMessageDTO{
		ID:        created.ID,
		PostID:    created.PostID,
		UserID:    created.UserID,
		Username:  username,
		Body:      created.Body,
		CreatedAt: created.CreatedAt.UTC().Format(time.RFC3339),
	}, nil
}
