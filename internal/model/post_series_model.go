package model

type PostSeries struct {
	PostID   int64 `db:"post_id" json:"post_id"`
	SeriesID int64 `db:"series_id" json:"series_id"`
}
