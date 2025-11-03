package model

import "time"

type UserIRacingLicense struct {
	ID            int64     `db:"id" json:"id"`
	UserIRacingID int64     `db:"user_iracing_id" json:"user_iracing_id"`
	Category      string    `db:"category" json:"category"`           // 'road','oval','dirt_road','dirt_oval'
	LicenseLevel  string    `db:"license_level" json:"license_level"` // 'R','D','C','B','A','P'
	IRating       int       `db:"irating" json:"irating"`
	UpdatedAt     time.Time `db:"updated_at" json:"updated_at,omitempty"`
}
