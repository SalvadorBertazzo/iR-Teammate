package model

import "time"

type PostApplication struct {
	ID          int64     `db:"id" json:"id"`
	PostID      int64     `db:"post_id" json:"post_id"`
	ApplicantID int64     `db:"applicant_id" json:"applicant_id"`
	Status      string    `db:"status" json:"status"` // pending, accepted, rejected
	Message     string    `db:"message" json:"message"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
