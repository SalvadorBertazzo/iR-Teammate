package model

type UserLanguage struct {
	UserID       int64  `db:"user_id" json:"user_id"`
	LanguageCode string `db:"language_code" json:"language_code"`
}

