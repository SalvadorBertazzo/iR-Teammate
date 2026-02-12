package model

type PostCategory struct {
	PostID   int64  `db:"post_id" json:"post_id"`
	Category string `db:"category" json:"category"`
}
