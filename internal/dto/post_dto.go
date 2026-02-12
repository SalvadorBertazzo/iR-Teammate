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
	CarIDs          []int64    `json:"car_ids,omitempty"`
	TrackID         *int64     `json:"track_id,omitempty"`
	Category        string     `json:"category"`
	Categories      []string   `json:"categories,omitempty"`
	SeriesIDs       []int64    `json:"series_ids,omitempty"`
	CarClassIDs     []int64    `json:"car_class_ids,omitempty"`
	TrackIDs        []int64    `json:"track_ids,omitempty"`
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
	LanguageCodes   []string   `json:"language_codes,omitempty"`

	// Expanded relations go in included block (only if ?expand=... is used)
	Included *PostIncludedDTO `json:"included,omitempty"`
}

type PostIncludedDTO struct {
	Event      *model.Event      `json:"event,omitempty"`
	Series     *model.Series     `json:"series,omitempty"`
	CarClass   *model.CarClass   `json:"car_class,omitempty"`
	Track      *model.Track      `json:"track,omitempty"`
	Cars       []*model.Car      `json:"cars,omitempty"`
	Languages  []*model.Language `json:"languages,omitempty"`
	AllSeries  []*model.Series   `json:"all_series,omitempty"`
	CarClasses []*model.CarClass `json:"car_classes,omitempty"`
	Tracks     []*model.Track    `json:"tracks,omitempty"`
}

type PostFilters struct {
	Search string `json:"search,omitempty"`

	UserID *int64 `json:"user_id,omitempty"`

	Category []string `json:"category,omitempty"`

	MinIRating *int `json:"min_irating,omitempty"`
	MaxIRating *int `json:"max_irating,omitempty"`

	MinLicenseLevel string   `json:"min_license_level,omitempty"`
	LicenseLevels   []string `json:"license_levels,omitempty"`

	SeriesIDs   []int64 `json:"series_ids,omitempty"`
	CarClassIDs []int64 `json:"car_class_ids,omitempty"`
	CarIDs      []int64 `json:"car_ids,omitempty"`
	TrackIDs    []int64 `json:"track_ids,omitempty"`

	LanguageCodes []string `json:"language_codes,omitempty"`

	EventIDs []int64 `json:"event_ids,omitempty"`
	HasEvent *bool   `json:"has_event,omitempty"`

	Timezone string `json:"timezone,omitempty"`

	Status []string `json:"status,omitempty"`

	EventStartFrom *time.Time `json:"event_start_from,omitempty"`
	EventStartTo   *time.Time `json:"event_start_to,omitempty"`

	SortBy    string `json:"sort_by,omitempty"`    // created_at, event_start_at, min_irating
	SortOrder string `json:"sort_order,omitempty"` // asc, desc

	Limit  int `json:"limit,omitempty"`
	Offset int `json:"offset,omitempty"`
}

// PostSearchResponse represents the response for post search with pagination metadata
type PostSearchResponse struct {
	Posts  []*PostDTO `json:"posts"`
	Total  int64      `json:"total"`
	Limit  int        `json:"limit"`
	Offset int        `json:"offset"`
}
