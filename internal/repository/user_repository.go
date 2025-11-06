package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*model.User, error) {
	var u model.User
	err := r.db.GetContext(ctx, &u, `
        SELECT id, discord_id, username, global_name, email, avatar, created_at
        FROM users
        WHERE id = ?`,
		id,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByDiscordID(ctx context.Context, discordID string) (*model.User, error) {
	var u model.User
	err := r.db.GetContext(ctx, &u, `
		SELECT id, discord_id, username, global_name, email, avatar, created_at
		FROM users
		WHERE discord_id = ?`,
		discordID,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) Create(ctx context.Context, u *model.User) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO users (discord_id, username, global_name, email, avatar)
		VALUES (?, ?, ?, ?, ?)`,
		u.DiscordID, u.Username, u.GlobalName, u.Email, u.Avatar,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *UserRepository) Update(ctx context.Context, u *model.User) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE users
		SET username = ?, global_name = ?, email = ?, avatar = ?
		WHERE discord_id = ?`,
		u.Username, u.GlobalName, u.Email, u.Avatar, u.DiscordID,
	)
	return err
}

func (r *UserRepository) UpsertByDiscordID(ctx context.Context, u *model.User) (*model.User, error) {
	existing, err := r.GetByDiscordID(ctx, u.DiscordID)
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

	return r.GetByDiscordID(ctx, u.DiscordID)
}
