package dto

import (
	"iR-Teammate/internal/model"
	"time"
)

type UserIRacingProfileDTO struct {
	ID                  int64                       `json:"id"`
	UserID              int64                       `json:"user_id"`
	IRacingID           *int64                      `json:"iracing_id,omitempty"`
	DisplayName         string                      `json:"display_name"`
	Club                *string                     `json:"club,omitempty"`
	Timezone            *string                     `json:"timezone,omitempty"`
	PreferredRacingTime *string                     `json:"preferred_racing_time,omitempty"`
	CreatedAt           time.Time                   `json:"created_at"`
	UpdatedAt           time.Time                   `json:"updated_at"`
	Licenses            []*model.UserIRacingLicense `json:"licenses"`
	Languages           []*model.Language           `json:"languages"`
}
