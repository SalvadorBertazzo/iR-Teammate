package model

type PostCar struct {
	PostID int64 `db:"post_id" json:"post_id"`
	CarID  int64 `db:"car_id" json:"car_id"`
}
