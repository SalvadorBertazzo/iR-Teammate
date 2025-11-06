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

	// Auth routes (public)
	authPublic := e.Group("/auth")                                   // Public auth route GROUP (Base: http://localhost:8080/auth)
	authPublic.GET("/discord/login", authHandler.DiscordLogin)       // Start Discord OAuth login (Example: GET http://localhost:8080/auth/discord/login)
	authPublic.GET("/discord/callback", authHandler.DiscordCallback) // Discord OAuth callback (Example: GET http://localhost:8080/auth/discord/callback)

	// Auth routes (protected)
	authProtected := e.Group("/auth", jwtMiddleware)  // Protected auth route GROUP (Base: http://localhost:8080/auth)
	authProtected.GET("/me", authHandler.Me)          // Get current user from JWT (Example: GET http://localhost:8080/auth/me)
	authProtected.POST("/logout", authHandler.Logout) // Clear session cookie (Example: POST http://localhost:8080/auth/logout)

	// Profile routes (all protected)
	profileGroup := e.Group("/profile", jwtMiddleware) // Protected profile route GROUP (Base: http://localhost:8080/profile)

	// iRacing Profile - Complete profile operations
	profileGroup.GET("/iracing", profileHandler.GetIRacingProfile)    // Get complete profile (with licenses & languages) (Example: GET http://localhost:8080/profile/iracing)
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
	catalogs.GET("/languages", catalogHandler.GetLanguages)    // List all languages (Example: GET http://localhost:8080/catalogs/languages)

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
}
