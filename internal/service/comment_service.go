package service

import (
	"context"
	"iR-Teammate/internal/dto"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
	"time"
)

type CommentService struct {
	comments *repository.CommentRepository
	users    *repository.UserRepository
}

func NewCommentService(comments *repository.CommentRepository, users *repository.UserRepository) *CommentService {
	return &CommentService{comments: comments, users: users}
}

func (s *CommentService) CreateRoot(ctx context.Context, postID int64, userID int64, body string) (*dto.CommentDTO, error) {
	c := &model.Comment{PostID: postID, UserID: userID, Body: body}
	id, err := s.comments.CreateRoot(ctx, c)
	if err != nil {
		return nil, err
	}
	return s.buildDTO(ctx, &model.Comment{ID: id, PostID: postID, UserID: userID, Body: body, CreatedAt: time.Now().UTC()}, nil)
}

func (s *CommentService) CreateReply(ctx context.Context, postID int64, parentID int64, userID int64, body string) (*dto.CommentDTO, error) {
	parent, err := s.comments.GetByID(ctx, parentID)
	if err != nil {
		return nil, err
	}
	if parent == nil || parent.PostID != postID {
		return nil, ErrNotFound
	}
	if parent.ParentCommentID != nil {
		return nil, ErrInvalidDepth
	}
	c := &model.Comment{PostID: postID, UserID: userID, ParentCommentID: &parentID, Body: body}
	id, err := s.comments.CreateReply(ctx, c)
	if err != nil {
		return nil, err
	}
	return s.buildDTO(ctx, &model.Comment{ID: id, PostID: postID, UserID: userID, ParentCommentID: &parentID, Body: body, CreatedAt: time.Now().UTC()}, nil)
}

func (s *CommentService) ListByPost(ctx context.Context, postID int64, expand map[string]bool) ([]*dto.CommentDTO, error) {
	roots, err := s.comments.ListRootsByPost(ctx, postID)
	if err != nil {
		return nil, err
	}
	result := make([]*dto.CommentDTO, 0, len(roots))
	for _, r := range roots {
		dtoItem, buildErr := s.buildDTO(ctx, r, expand)
		if buildErr != nil {
			return nil, buildErr
		}
		result = append(result, dtoItem)
	}
	return result, nil
}

func (s *CommentService) SoftDelete(ctx context.Context, id int64, userID int64) (bool, error) {
	return s.comments.SoftDeleteByIDAndUser(ctx, id, userID)
}

// buildDTO builds the CommentDTO applying soft delete rules and expand
func (s *CommentService) buildDTO(ctx context.Context, c *model.Comment, expand map[string]bool) (*dto.CommentDTO, error) {
	var createdAtStr string
	if !c.CreatedAt.IsZero() {
		createdAtStr = c.CreatedAt.UTC().Format(time.RFC3339Nano)
	}
	var deletedAtStr *string
	var body string
	if c.DeletedAt != nil {
		s := c.DeletedAt.UTC().Format(time.RFC3339Nano)
		deletedAtStr = &s
		body = "[deleted]"
	} else {
		body = c.Body
	}

	out := &dto.CommentDTO{
		ID:              c.ID,
		PostID:          c.PostID,
		UserID:          c.UserID,
		ParentCommentID: c.ParentCommentID,
		Body:            body,
		CreatedAt:       createdAtStr,
		DeletedAt:       deletedAtStr,
	}

	if len(expand) == 0 {
		return out, nil
	}

	inc := &dto.CommentIncludedDTO{}

	if expand["user"] {
		if u, err := s.users.GetByID(ctx, c.UserID); err == nil && u != nil {
			inc.User = &dto.UserMinDTO{ID: u.ID, Username: u.Username}
		}
	}

	if expand["replies"] && c.ParentCommentID == nil {
		replies, err := s.comments.ListReplies(ctx, c.ID)
		if err != nil {
			return nil, err
		}
		for _, r := range replies {
			rDTO, convErr := s.buildDTO(ctx, r, map[string]bool{"user": expand["user"]})
			if convErr != nil {
				return nil, convErr
			}
			inc.Replies = append(inc.Replies, rDTO)
		}
	}

	if inc.User != nil || len(inc.Replies) > 0 {
		out.Included = inc
	}
	return out, nil
}

var (
	ErrNotFound     = Err("not found")
	ErrInvalidDepth = Err("invalid comment depth")
)

type Err string

func (e Err) Error() string { return string(e) }
