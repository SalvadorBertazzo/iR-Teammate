package dto

type PostApplicationDTO struct {
	ID          int64                       `json:"id"`
	PostID      int64                       `json:"post_id"`
	ApplicantID int64                       `json:"applicant_id"`
	Status      string                      `json:"status"` // pending, accepted, rejected
	Message     string                      `json:"message"`
	CreatedAt   string                      `json:"created_at"`
	UpdatedAt   string                      `json:"updated_at"`
	Included    *PostApplicationIncludedDTO `json:"included,omitempty"`
}

type PostApplicationIncludedDTO struct {
	Applicant *UserMinDTO `json:"applicant,omitempty"`
	Post      *PostDTO    `json:"post,omitempty"`
}
