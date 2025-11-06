package model

import "time"

type Comment struct {
	ID              int64      `db:"id" json:"id"`
	PostID          int64      `db:"post_id" json:"post_id"`
	UserID          int64      `db:"user_id" json:"user_id"`
	ParentCommentID *int64     `db:"parent_comment_id" json:"parent_comment_id,omitempty"`
	Body            string     `db:"body" json:"body"`
	CreatedAt       time.Time  `db:"created_at" json:"created_at"`
	DeletedAt       *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`
}
