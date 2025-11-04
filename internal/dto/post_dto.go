package dto

import (
	"iR-Teammate/internal/model"
	"time"
)

type PostDTO struct {
	ID              int64      `json:"id"`
	UserID          int64      `json:"user_id"`
	Title           string     `json:"title"`
	Body            string     `json:"body"`
	EventID         *int64     `json:"event_id,omitempty"`
	SeriesID        *int64     `json:"series_id,omitempty"`
	CarClassID      *int64     `json:"car_class_id,omitempty"`
	TrackID         *int64     `json:"track_id,omitempty"`
	Category        string     `json:"category"`
	MinLicenseLevel string     `json:"min_license_level"`
	MinIRating      int        `json:"min_irating"`
	Timezone        string     `json:"timezone"`
	EventStartAt    *time.Time `json:"event_start_at,omitempty"`
	SlotsTotal      int        `json:"slots_total"`
	Status          string     `json:"status"`
	IsPublic        bool       `json:"is_public"`
	ContactHint     string     `json:"contact_hint"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Expanded relations (optional)
	Event     *model.Event      `json:"event,omitempty"`
	Series    *model.Series     `json:"series,omitempty"`
	CarClass  *model.CarClass   `json:"car_class,omitempty"`
	Track     *model.Track      `json:"track,omitempty"`
	Cars      []*model.Car      `json:"cars,omitempty"`
	Languages []*model.Language `json:"languages,omitempty"`
}
