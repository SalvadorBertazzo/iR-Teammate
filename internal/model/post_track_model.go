package model

type PostTrack struct {
	PostID  int64 `db:"post_id" json:"post_id"`
	TrackID int64 `db:"track_id" json:"track_id"`
}
