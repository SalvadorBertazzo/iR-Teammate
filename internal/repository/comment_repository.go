package repository

import (
	"context"
	"database/sql"
	"iR-Teammate/internal/model"

	"github.com/jmoiron/sqlx"
)

type CommentRepository struct {
	db *sqlx.DB
}

func NewCommentRepository(db *sqlx.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) CreateRoot(ctx context.Context, c *model.Comment) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
        INSERT INTO comments (post_id, user_id, body)
        VALUES (?, ?, ?)
    `, c.PostID, c.UserID, c.Body)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *CommentRepository) CreateReply(ctx context.Context, c *model.Comment) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
        INSERT INTO comments (post_id, user_id, parent_comment_id, body)
        VALUES (?, ?, ?, ?)
    `, c.PostID, c.UserID, c.ParentCommentID, c.Body)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *CommentRepository) GetByID(ctx context.Context, id int64) (*model.Comment, error) {
	var c model.Comment
	err := r.db.GetContext(ctx, &c, `
        SELECT id, post_id, user_id, parent_comment_id, body, created_at, deleted_at
        FROM comments
        WHERE id = ?
    `, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CommentRepository) ListRootsByPost(ctx context.Context, postID int64) ([]*model.Comment, error) {
	var items []*model.Comment
	if err := r.db.SelectContext(ctx, &items, `
        SELECT id, post_id, user_id, parent_comment_id, body, created_at, deleted_at
        FROM comments
        WHERE post_id = ? AND parent_comment_id IS NULL
        ORDER BY created_at DESC
    `, postID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CommentRepository) ListReplies(ctx context.Context, parentCommentID int64) ([]*model.Comment, error) {
	var items []*model.Comment
	if err := r.db.SelectContext(ctx, &items, `
        SELECT c.id, c.post_id, c.user_id, c.parent_comment_id, c.body, c.created_at, c.deleted_at
        FROM comments c
        INNER JOIN comments parent ON c.parent_comment_id = parent.id
        WHERE c.parent_comment_id = ? AND parent.deleted_at IS NULL
        ORDER BY c.created_at ASC
    `, parentCommentID); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *CommentRepository) SoftDeleteByIDAndUser(ctx context.Context, id int64, userID int64) (bool, error) {
	res, err := r.db.ExecContext(ctx, `
        UPDATE comments
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND deleted_at IS NULL
    `, id, userID)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}
