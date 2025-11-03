package model

type Language struct {
	Code string `db:"code" json:"code"` // ISO 639-1: 'es','en','pt', etc.
	Name string `db:"name" json:"name"`
}
