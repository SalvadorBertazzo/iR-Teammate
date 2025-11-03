package server

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

// JWTAuthMiddleware validates the JWT from the "session" cookie
func JWTAuthMiddleware(jwtSecret []byte) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cookie, err := c.Cookie("session")
			if err != nil || cookie == nil || cookie.Value == "" {
				return c.String(http.StatusUnauthorized, "no session cookie")
			}

			token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return jwtSecret, nil
			})

			if err != nil || !token.Valid {
				return c.String(http.StatusUnauthorized, "invalid token")
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				return c.String(http.StatusUnauthorized, "invalid claims")
			}

			// Save claims in the context for later use
			sub, ok := claims["sub"].(float64)
			if !ok {
				return c.String(http.StatusUnauthorized, "invalid user_id in token")
			}
			c.Set("user_id", int64(sub))

			c.Set("discord_id", claims["discord_id"])

			return next(c)
		}
	}
}
