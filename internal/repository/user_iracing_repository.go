package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type UserIRacingRepository struct {
	db *sqlx.DB
}

func NewUserIRacingRepository(db *sqlx.DB) *UserIRacingRepository {
	return &UserIRacingRepository{db: db}
}

func (r *UserIRacingRepository) GetByUserID(ctx context.Context, userID int64) (*model.UserIRacing, error) {
	var u model.UserIRacing
	err := r.db.GetContext(ctx, &u, `
		SELECT id, user_id, iracing_id, display_name, club, timezone, preferred_racing_time, contact_hint, created_at, updated_at
		FROM user_iracings
		WHERE user_id = ?`,
		userID,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserIRacingRepository) Create(ctx context.Context, u *model.UserIRacing) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO user_iracings (user_id, iracing_id, display_name, club, timezone, preferred_racing_time, contact_hint)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		u.UserID, u.IRacingID, u.DisplayName, u.Club, u.Timezone, u.PreferredRacingTime, u.ContactHint,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *UserIRacingRepository) Update(ctx context.Context, u *model.UserIRacing) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE user_iracings
		SET iracing_id = ?, display_name = ?, club = ?, timezone = ?, preferred_racing_time = ?, contact_hint = ?, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = ?`,
		u.IRacingID, u.DisplayName, u.Club, u.Timezone, u.PreferredRacingTime, u.ContactHint, u.UserID,
	)
	return err
}

func (r *UserIRacingRepository) UpsertByUserID(ctx context.Context, u *model.UserIRacing) (*model.UserIRacing, error) {
	existing, err := r.GetByUserID(ctx, u.UserID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		id, err := r.Create(ctx, u)
		if err != nil {
			return nil, err
		}
		u.ID = id
		return u, nil
	}

	u.ID = existing.ID
	if err := r.Update(ctx, u); err != nil {
		return nil, err
	}

	return r.GetByUserID(ctx, u.UserID)
}
