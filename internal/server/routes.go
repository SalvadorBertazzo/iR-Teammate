package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo, dependencies *Dependencies) {
	jwtMiddleware := JWTAuthMiddleware([]byte(dependencies.Config.JWT.Secret))

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Handlers
	authHandler := dependencies.AuthHandler
	profileHandler := dependencies.ProfileHandler
	catalogHandler := dependencies.CatalogHandler
	postHandler := dependencies.PostHandler
	commentHandler := dependencies.CommentHandler
	postApplicationHandler := dependencies.PostApplicationHandler
	teamHandler := dependencies.TeamHandler

	// Auth routes (public)
	authPublic := e.Group("/auth")                                   // Public auth route GROUP (Base: http://localhost:8080/auth)
	authPublic.GET("/discord/login", authHandler.DiscordLogin)       // Start Discord OAuth login (Example: GET http://localhost:8080/auth/discord/login)
	authPublic.GET("/discord/callback", authHandler.DiscordCallback) // Discord OAuth callback (Example: GET http://localhost:8080/auth/discord/callback)

	// Auth routes (protected)
	authProtected := e.Group("/auth", jwtMiddleware)  // Protected auth route GROUP (Base: http://localhost:8080/auth)
	authProtected.GET("/me", authHandler.Me)          // Get current user from JWT (Example: GET http://localhost:8080/auth/me)
	authProtected.POST("/logout", authHandler.Logout) // Clear session cookie (Example: POST http://localhost:8080/auth/logout)

	// Profile routes
	// Public route for viewing other users' profiles
	profilePublic := e.Group("/profile")                                    // Public profile route GROUP (Base: http://localhost:8080/profile)
	profilePublic.GET("/iracing/:id", profileHandler.GetUserIRacingProfile) // Get iRacing profile by user ID (Example: GET http://localhost:8080/profile/iracing/1)

	// Protected profile routes
	profileGroup := e.Group("/profile", jwtMiddleware) // Protected profile route GROUP (Base: http://localhost:8080/profile)

	// iRacing Profile - Complete profile operations
	profileGroup.GET("/iracing", profileHandler.GetIRacingProfile)    // Get current user's complete profile (with licenses & languages) (Example: GET http://localhost:8080/profile/iracing)
	profileGroup.PUT("/iracing", profileHandler.UpdateIRacingProfile) // Update basic profile info (Example: PUT http://localhost:8080/profile/iracing)

	// Licenses - Individual license operations
	profileGroup.GET("/iracing/licenses", profileHandler.GetLicenses)   // Get all licenses (Example: GET http://localhost:8080/profile/iracing/licenses)
	profileGroup.PUT("/iracing/licenses", profileHandler.UpsertLicense) // Create/update a specific license (Example: PUT http://localhost:8080/profile/iracing/licenses)

	// Languages - Language operations
	profileGroup.GET("/iracing/languages", profileHandler.GetLanguages)    // Get user's languages (Example: GET http://localhost:8080/profile/iracing/languages)
	profileGroup.PUT("/iracing/languages", profileHandler.UpsertLanguages) // Update user's languages (replaces list) (Example: PUT http://localhost:8080/profile/iracing/languages)

	// Catalog routes (public)
	catalogs := e.Group("/catalogs")                           // Public catalog route GROUP (Base: http://localhost:8080/catalogs)
	catalogs.GET("/series", catalogHandler.GetSeries)          // List all series (Example: GET http://localhost:8080/catalogs/series)
	catalogs.GET("/car-classes", catalogHandler.GetCarClasses) // List all car classes (Example: GET http://localhost:8080/catalogs/car-classes)
	catalogs.GET("/cars", catalogHandler.GetCars)              // List all cars (Example: GET http://localhost:8080/catalogs/cars)
	catalogs.GET("/events", catalogHandler.GetEvents)          // List all events (Example: GET http://localhost:8080/catalogs/events)
	catalogs.GET("/tracks", catalogHandler.GetTracks)          // List all tracks (Example: GET http://localhost:8080/catalogs/tracks)
	catalogs.GET("/languages", catalogHandler.GetLanguages)         // List all languages (Example: GET http://localhost:8080/catalogs/languages)
	catalogs.GET("/relationships", catalogHandler.GetRelationships) // Get catalog relationships (Example: GET http://localhost:8080/catalogs/relationships)

	// Posts routes
	postsPublic := e.Group("/posts")                            // Public posts route GROUP (Base: http://localhost:8080/posts)
	postsPublic.GET("", postHandler.ListPublic)                 // List public open posts (Example: GET http://localhost:8080/posts)
	postsPublic.GET("/:id", postHandler.Get)                    // Get post by id (Example: GET http://localhost:8080/posts/1)
	postsPublic.GET("/:id/comments", commentHandler.ListByPost) // List comments for post (Example: GET http://localhost:8080/posts/1/comments?expand=user,replies)

	postsProtected := e.Group("/posts", jwtMiddleware)                                   // Protected posts route GROUP
	postsProtected.POST("", postHandler.Create)                                          // Create post (Example: POST http://localhost:8080/posts)
	postsProtected.GET("/mine", postHandler.ListMine)                                    // List current user's posts (Example: GET http://localhost:8080/posts/mine)
	postsProtected.PUT("/:id", postHandler.Update)                                       // Update post by id (Example: PUT http://localhost:8080/posts/1)
	postsProtected.DELETE("/:id", postHandler.Delete)                                    // Delete post by id (Example: DELETE http://localhost:8080/posts/1)
	postsProtected.POST("/:id/comments", commentHandler.CreateRoot)                      // Create root comment (Example: POST http://localhost:8080/posts/1/comments)
	postsProtected.POST("/:id/comments/:comment_id/replies", commentHandler.CreateReply) // Create a reply (Example: POST http://localhost:8080/posts/1/comments/10/replies)
	postsProtected.DELETE("/:id/comments/:comment_id", commentHandler.Delete)            // Soft delete a comment (Example: DELETE http://localhost:8080/posts/1/comments/10)

	// Post Applications routes
	postsProtected.POST("/:id/applications", postApplicationHandler.Create)                               // Create application to post (Example: POST http://localhost:8080/posts/1/applications)
	postsProtected.GET("/:id/applications", postApplicationHandler.ListByPost)                            // List applications for post (Example: GET http://localhost:8080/posts/1/applications?status=pending)
	postsProtected.GET("/:id/applications/:application_id", postApplicationHandler.GetByID)               // Get application by id (Example: GET http://localhost:8080/posts/1/applications/10)
	postsProtected.PATCH("/:id/applications/:application_id/status", postApplicationHandler.UpdateStatus) // Update application status (Example: PATCH http://localhost:8080/posts/1/applications/10/status)
	postsPublic.GET("/:id/applications/count", postApplicationHandler.CountByPostAndStatus)               // Count applications by status (Example: GET http://localhost:8080/posts/1/applications/count?status=pending)

	// Applications routes (protected)
	applicationsProtected := e.Group("/applications", jwtMiddleware)           // Protected applications route GROUP
	applicationsProtected.GET("/mine", postApplicationHandler.ListByApplicant) // List current user's applications (Example: GET http://localhost:8080/applications/mine)

	// Team routes (protected — only team members can access)
	postsProtected.GET("/:id/team", teamHandler.GetTeam)                              // Get team info (members) (Example: GET http://localhost:8080/posts/1/team)
	postsProtected.DELETE("/:id/team", teamHandler.DeleteTeam)                        // Delete team (Example: DELETE http://localhost:8080/posts/1/team)
	postsProtected.GET("/:id/team/messages", teamHandler.ListMessages)                // List chat messages (Example: GET http://localhost:8080/posts/1/team/messages?after=0)
	postsProtected.POST("/:id/team/messages", teamHandler.CreateMessage)              // Send a chat message (Example: POST http://localhost:8080/posts/1/team/messages)
	postsProtected.DELETE("/:id/team/members/:user_id", teamHandler.RemoveMember)     // Remove/leave team (Example: DELETE http://localhost:8080/posts/1/team/members/5)

	// My teams (protected)
	teamsProtected := e.Group("/teams", jwtMiddleware)
	teamsProtected.GET("/mine", teamHandler.GetMyTeams) // List all teams the user belongs to (Example: GET http://localhost:8080/teams/mine)
}
