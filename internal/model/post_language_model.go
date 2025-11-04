package model

type PostLanguage struct {
	PostID       int64  `db:"post_id" json:"post_id"`
	LanguageCode string `db:"language_code" json:"language_code"`
}
