package model

import "time"

type User struct {
	ID         int64     `db:"id" json:"id"`
	DiscordID  string    `db:"discord_id" json:"discord_id"`
	Username   string    `db:"username" json:"username"`
	GlobalName *string   `db:"global_name" json:"global_name,omitempty"`
	Email      *string   `db:"email" json:"email,omitempty"`
	Avatar     *string   `db:"avatar" json:"avatar,omitempty"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

