package dto

type CommentDTO struct {
	ID              int64               `json:"id"`
	PostID          int64               `json:"post_id"`
	UserID          int64               `json:"user_id"`
	ParentCommentID *int64              `json:"parent_comment_id,omitempty"`
	Body            string              `json:"body"`
	CreatedAt       string              `json:"created_at"`
	DeletedAt       *string             `json:"deleted_at,omitempty"`
	Included        *CommentIncludedDTO `json:"included,omitempty"`
}

type CommentIncludedDTO struct {
	User    *UserMinDTO   `json:"user,omitempty"`
	Replies []*CommentDTO `json:"replies,omitempty"`
}
