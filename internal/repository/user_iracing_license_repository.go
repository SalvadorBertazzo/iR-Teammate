package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type UserIRacingLicenseRepository struct {
	db *sqlx.DB
}

func NewUserIRacingLicenseRepository(db *sqlx.DB) *UserIRacingLicenseRepository {
	return &UserIRacingLicenseRepository{db: db}
}

func (r *UserIRacingLicenseRepository) GetByUserIRacingID(ctx context.Context, userIRacingID int64) ([]*model.UserIRacingLicense, error) {
	var licenses []*model.UserIRacingLicense
	err := r.db.SelectContext(ctx, &licenses, `
		SELECT id, user_iracing_id, category, license_level, irating, updated_at
		FROM user_iracing_licenses
		WHERE user_iracing_id = ?
		ORDER BY category`,
		userIRacingID,
	)
	if err != nil {
		return nil, err
	}
	return licenses, nil
}

func (r *UserIRacingLicenseRepository) GetByUserIRacingIDAndCategory(ctx context.Context, userIRacingID int64, category string) (*model.UserIRacingLicense, error) {
	var license model.UserIRacingLicense
	err := r.db.GetContext(ctx, &license, `
		SELECT id, user_iracing_id, category, license_level, irating, updated_at
		FROM user_iracing_licenses
		WHERE user_iracing_id = ? AND category = ?`,
		userIRacingID, category,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &license, nil
}

func (r *UserIRacingLicenseRepository) Create(ctx context.Context, license *model.UserIRacingLicense) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO user_iracing_licenses (user_iracing_id, category, license_level, irating, updated_at)
		VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
		license.UserIRacingID, license.Category, license.LicenseLevel, license.IRating,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *UserIRacingLicenseRepository) Update(ctx context.Context, license *model.UserIRacingLicense) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE user_iracing_licenses
		SET license_level = ?, irating = ?, updated_at = CURRENT_TIMESTAMP
		WHERE user_iracing_id = ? AND category = ?`,
		license.LicenseLevel, license.IRating, license.UserIRacingID, license.Category,
	)
	return err
}

func (r *UserIRacingLicenseRepository) UpsertByUserIRacingIDAndCategory(ctx context.Context, license *model.UserIRacingLicense) (*model.UserIRacingLicense, error) {
	existing, err := r.GetByUserIRacingIDAndCategory(ctx, license.UserIRacingID, license.Category)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		id, err := r.Create(ctx, license)
		if err != nil {
			return nil, err
		}
		license.ID = id
		return license, nil
	}

	license.ID = existing.ID
	if err := r.Update(ctx, license); err != nil {
		return nil, err
	}

	return r.GetByUserIRacingIDAndCategory(ctx, license.UserIRacingID, license.Category)
}
