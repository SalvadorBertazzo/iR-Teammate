package service

import (
	"context"
	"fmt"
	"iR-Teammate/internal/dto"
	"iR-Teammate/internal/model"
	"iR-Teammate/internal/repository"
)

type ProfileService struct {
	userIRacingRepository        *repository.UserIRacingRepository
	userIRacingLicenseRepository *repository.UserIRacingLicenseRepository
	userLanguageRepository       *repository.UserLanguageRepository
}

func NewProfileService(userIRacingRepository *repository.UserIRacingRepository, userIRacingLicenseRepository *repository.UserIRacingLicenseRepository, userLanguageRepository *repository.UserLanguageRepository) *ProfileService {
	return &ProfileService{
		userIRacingRepository:        userIRacingRepository,
		userIRacingLicenseRepository: userIRacingLicenseRepository,
		userLanguageRepository:       userLanguageRepository,
	}
}

func (s *ProfileService) GetUserIRacing(ctx context.Context, userID int64) (*dto.UserIRacingProfileDTO, error) {
	// Obtener el perfil base
	profile, err := s.userIRacingRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}
	if profile == nil {
		return nil, nil
	}

	// Obtener licencias
	licenses, err := s.userIRacingLicenseRepository.GetByUserIRacingID(ctx, profile.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get licenses: %w", err)
	}

	// Obtener idiomas (ya devuelve Language completo con JOIN)
	languages, err := s.userLanguageRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get languages: %w", err)
	}

	// Construir el DTO
	dto := &dto.UserIRacingProfileDTO{
		ID:                  profile.ID,
		UserID:              profile.UserID,
		IRacingID:           profile.IRacingID,
		DisplayName:         profile.DisplayName,
		Club:                profile.Club,
		Timezone:            profile.Timezone,
		PreferredRacingTime: profile.PreferredRacingTime,
		ContactHint:         profile.ContactHint,
		CreatedAt:           profile.CreatedAt,
		UpdatedAt:           profile.UpdatedAt,
		Licenses:            licenses,
		Languages:           languages,
	}

	return dto, nil
}

func (s *ProfileService) UpdateUserIRacing(ctx context.Context, userID int64, updateData *model.UserIRacing) (*model.UserIRacing, error) {
	existing, err := s.userIRacingRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}
	if existing == nil {
		return nil, fmt.Errorf("profile not found")
	}

	if updateData.DisplayName != "" {
		existing.DisplayName = updateData.DisplayName
	}
	if updateData.IRacingID != nil {
		existing.IRacingID = updateData.IRacingID
	}
	if updateData.Club != nil {
		existing.Club = updateData.Club
	}
	if updateData.Timezone != nil {
		existing.Timezone = updateData.Timezone
	}
	if updateData.PreferredRacingTime != nil {
		existing.PreferredRacingTime = updateData.PreferredRacingTime
	}
	if updateData.ContactHint != nil {
		existing.ContactHint = updateData.ContactHint
	}

	if err := s.userIRacingRepository.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return s.userIRacingRepository.GetByUserID(ctx, userID)
}

func (s *ProfileService) GetLicenses(ctx context.Context, userID int64) ([]*model.UserIRacingLicense, error) {
	userIRacing, err := s.userIRacingRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user iracing: %w", err)
	}
	if userIRacing == nil {
		return nil, fmt.Errorf("user iracing profile not found")
	}

	licenses, err := s.userIRacingLicenseRepository.GetByUserIRacingID(ctx, userIRacing.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get licenses: %w", err)
	}
	return licenses, nil
}

func (s *ProfileService) UpsertLicense(ctx context.Context, userID int64, license *model.UserIRacingLicense) (*model.UserIRacingLicense, error) {
	userIRacing, err := s.userIRacingRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user iracing: %w", err)
	}
	if userIRacing == nil {
		return nil, fmt.Errorf("user iracing profile not found")
	}

	validCategories := map[string]bool{"sports_car": true, "formula": true, "oval": true, "dirt_road": true, "dirt_oval": true}
	if !validCategories[license.Category] {
		return nil, fmt.Errorf("invalid category: %s", license.Category)
	}

	validLevels := map[string]bool{"R": true, "D": true, "C": true, "B": true, "A": true, "P": true}
	if !validLevels[license.LicenseLevel] {
		return nil, fmt.Errorf("invalid license level: %s", license.LicenseLevel)
	}

	license.UserIRacingID = userIRacing.ID
	return s.userIRacingLicenseRepository.UpsertByUserIRacingIDAndCategory(ctx, license)
}

func (s *ProfileService) GetLanguages(ctx context.Context, userID int64) ([]*model.Language, error) {
	languages, err := s.userLanguageRepository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get languages: %w", err)
	}
	return languages, nil
}

func (s *ProfileService) UpsertLanguages(ctx context.Context, userID int64, languageCodes []string) error {
	allLanguages, err := s.userLanguageRepository.GetAllLanguages(ctx)
	if err != nil {
		return fmt.Errorf("failed to validate languages: %w", err)
	}

	validCodes := make(map[string]bool)
	for _, lang := range allLanguages {
		validCodes[lang.Code] = true
	}

	for _, code := range languageCodes {
		if !validCodes[code] {
			return fmt.Errorf("invalid language code: %s", code)
		}
	}

	return s.userLanguageRepository.UpsertLanguages(ctx, userID, languageCodes)
}

func (s *ProfileService) GetAllLanguages(ctx context.Context) ([]*model.Language, error) {
	languages, err := s.userLanguageRepository.GetAllLanguages(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get languages catalog: %w", err)
	}
	return languages, nil
}
