package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"iR-Teammate/internal/config"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
)

type AuthService struct {
	userRepository        *repository.UserRepository
	userIRacingRepository *repository.UserIRacingRepository
	oauthCfg              *oauth2.Config
	jwtSecret             []byte
	jwtExpiry             time.Duration
}

func NewAuthService(userRepository *repository.UserRepository, userIRacingRepository *repository.UserIRacingRepository, oauthCfg *oauth2.Config, jwtConfig config.JWTConfig) *AuthService {
	return &AuthService{
		userRepository:        userRepository,
		userIRacingRepository: userIRacingRepository,
		oauthCfg:              oauthCfg,
		jwtSecret:             []byte(jwtConfig.Secret),
		jwtExpiry:             jwtConfig.Expiry,
	}
}

type StartLoginResult struct {
	State       string
	RedirectURL string
}

func (s *AuthService) StartDiscordLogin() (StartLoginResult, error) {
	state, err := generateState()
	if err != nil {
		return StartLoginResult{}, err
	}
	url := s.oauthCfg.AuthCodeURL(state)
	return StartLoginResult{
		State:       state,
		RedirectURL: url,
	}, nil
}

func (s *AuthService) HandleDiscordCallback(ctx context.Context, code, state, expectedState string) (string, error) {
	if state == "" || expectedState == "" || state != expectedState {
		return "", errors.New("invalid state")
	}

	tok, err := s.oauthCfg.Exchange(ctx, code)
	if err != nil {
		return "", fmt.Errorf("token exchange failed: %w", err)
	}

	discordUser, err := s.fetchDiscordUser(ctx, tok.AccessToken)
	if err != nil {
		return "", fmt.Errorf("fetch discord user failed: %w", err)
	}

	usr := &model.User{
		DiscordID: discordUser.ID,
		Username:  discordUser.Username,
	}
	if discordUser.GlobalName != "" {
		usr.GlobalName = &discordUser.GlobalName
	}
	if discordUser.Email != "" {
		usr.Email = &discordUser.Email
	}
	if discordUser.Avatar != "" {
		usr.Avatar = &discordUser.Avatar
	}

	// Upsert user
	saved, err := s.userRepository.UpsertByDiscordID(ctx, usr)
	if err != nil {
		return "", fmt.Errorf("upsert user failed: %w", err)
	}

	// Auto-create user_iracing if it doesn't exist
	existingIRacing, err := s.userIRacingRepository.GetByUserID(ctx, saved.ID)
	if err != nil {
		return "", fmt.Errorf("check user_iracing failed: %w", err)
	}
	if existingIRacing == nil {
		displayName := discordUser.Username
		if discordUser.GlobalName != "" {
			displayName = discordUser.GlobalName
		}

		newIRacing := &model.UserIRacing{
			UserID:      saved.ID,
			DisplayName: displayName,
		}
		_, err = s.userIRacingRepository.Create(ctx, newIRacing)
		if err != nil {
			return "", fmt.Errorf("create user_iracing failed: %w", err)
		}
	}

	// Generate JWT
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":        saved.ID,
		"discord_id": saved.DiscordID,
		"iat":        now.Unix(),
		"exp":        now.Add(s.jwtExpiry).Unix(),
	}
	j := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := j.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("sign jwt failed: %w", err)
	}

	return signed, nil
}

type discordUserResponse struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	GlobalName string `json:"global_name"`
	Email      string `json:"email"`
	Avatar     string `json:"avatar"`
}

func (s *AuthService) fetchDiscordUser(ctx context.Context, accessToken string) (*discordUserResponse, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://discord.com/api/users/@me", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("discord /@me status=%d", resp.StatusCode)
	}

	var du discordUserResponse
	if err := json.NewDecoder(resp.Body).Decode(&du); err != nil {
		return nil, err
	}
	return &du, nil
}

// GetUserByID returns basic user information (for auth endpoints only)
func (s *AuthService) GetUserByID(ctx context.Context, userID int64) (*model.User, error) {
	user, err := s.userRepository.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func generateState() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}
