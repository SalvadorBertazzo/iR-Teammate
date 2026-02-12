package model

import "time"

type UserIRacing struct {
	ID                  int64     `db:"id" json:"id"`
	UserID              int64     `db:"user_id" json:"user_id"`
	IRacingID           *int64    `db:"iracing_id" json:"iracing_id,omitempty"`
	DisplayName         string    `db:"display_name" json:"display_name"`
	Club                *string   `db:"club" json:"club,omitempty"`
	Timezone            *string   `db:"timezone" json:"timezone,omitempty"`
	PreferredRacingTime *string   `db:"preferred_racing_time" json:"preferred_racing_time,omitempty"`
	ContactHint         *string   `db:"contact_hint" json:"contact_hint,omitempty"`
	CreatedAt           time.Time `db:"created_at" json:"created_at"`
	UpdatedAt           time.Time `db:"updated_at" json:"updated_at"`
}
