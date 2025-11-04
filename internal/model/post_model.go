package model

import "time"

type Post struct {
	ID              int64      `db:"id" json:"id"`
	UserID          int64      `db:"user_id" json:"user_id"`
	Title           string     `db:"title" json:"title"`
	Body            string     `db:"body" json:"body"`
	EventID         *int64     `db:"event_id" json:"event_id,omitempty"`
	SeriesID        *int64     `db:"series_id" json:"series_id,omitempty"`
	CarClassID      *int64     `db:"car_class_id" json:"car_class_id,omitempty"`
	TrackID         *int64     `db:"track_id" json:"track_id,omitempty"`
	Category        string     `db:"category" json:"category"`
	MinLicenseLevel string     `db:"min_license_level" json:"min_license_level"`
	MinIRating      int        `db:"min_irating" json:"min_irating"`
	Timezone        string     `db:"timezone" json:"timezone"`
	EventStartAt    *time.Time `db:"event_start_at" json:"event_start_at,omitempty"`
	SlotsTotal      int        `db:"slots_total" json:"slots_total"`
	Status          string     `db:"status" json:"status"`
	IsPublic        bool       `db:"is_public" json:"is_public"`
	ContactHint     string     `db:"contact_hint" json:"contact_hint"`
	CreatedAt       time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at" json:"updated_at"`
}
