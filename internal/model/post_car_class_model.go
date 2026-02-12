package model

type PostCarClass struct {
	PostID     int64 `db:"post_id" json:"post_id"`
	CarClassID int64 `db:"car_class_id" json:"car_class_id"`
}
