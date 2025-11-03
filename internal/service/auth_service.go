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
	repository *repository.UserRepository
	oauthCfg   *oauth2.Config
	jwtSecret  []byte
	jwtExpiry  time.Duration
}

func NewAuthService(repository *repository.UserRepository, oauthCfg *oauth2.Config, jwtConfig config.JWTConfig) *AuthService {
	return &AuthService{
		repository: repository,
		oauthCfg:   oauthCfg,
		jwtSecret:  []byte(jwtConfig.Secret),
		jwtExpiry:  jwtConfig.Expiry,
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
	saved, err := s.repository.UpsertByDiscordID(ctx, usr)
	if err != nil {
		return "", fmt.Errorf("upsert user failed: %w", err)
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

func generateState() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}
