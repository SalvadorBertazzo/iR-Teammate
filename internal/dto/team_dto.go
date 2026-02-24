package dto

// TeamMemberDTO represents a member of a team (post owner or accepted applicant)
type TeamMemberDTO struct {
	UserID   int64  `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"` // "owner" or "member"
	JoinedAt string `json:"joined_at"`
}

// MyTeamDTO is a lightweight summary of a team the current user belongs to
type MyTeamDTO struct {
	PostID int64  `json:"post_id"`
	Title  string `json:"title"`
	Role   string `json:"role"` // "owner" or "member"
}

// TeamDTO represents a team (derived from a post + accepted applications)
type TeamDTO struct {
	PostID  int64           `json:"post_id"`
	Title   string          `json:"title"`
	Members []*TeamMemberDTO `json:"members"`
}

// TeamMessageDTO represents a single chat message
type TeamMessageDTO struct {
	ID        int64      `json:"id"`
	PostID    int64      `json:"post_id"`
	UserID    int64      `json:"user_id"`
	Username  string     `json:"username"`
	Body      string     `json:"body"`
	CreatedAt string     `json:"created_at"`
}
