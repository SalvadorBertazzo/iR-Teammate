package model

type SeriesCategory struct {
	SeriesID int64  `db:"series_id" json:"series_id"`
	Category string `db:"category" json:"category"`
}

type SeriesCarClass struct {
	SeriesID   int64 `db:"series_id" json:"series_id"`
	CarClassID int64 `db:"car_class_id" json:"car_class_id"`
}

type CarClassCar struct {
	CarClassID int64 `db:"car_class_id" json:"car_class_id"`
	CarID      int64 `db:"car_id" json:"car_id"`
}
