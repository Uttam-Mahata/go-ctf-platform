package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/go-ctf-platform/backend/internal/config"
	"github.com/go-ctf-platform/backend/internal/handlers"
	"github.com/go-ctf-platform/backend/internal/middleware"
	"github.com/go-ctf-platform/backend/internal/repositories"
	"github.com/go-ctf-platform/backend/internal/services"
	"github.com/golang-jwt/jwt/v5"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Repositories
	userRepo := repositories.NewUserRepository()
	challengeRepo := repositories.NewChallengeRepository()
	submissionRepo := repositories.NewSubmissionRepository()

	// Services
	emailService := services.NewEmailService(cfg)
	authService := services.NewAuthService(userRepo, emailService, cfg)
	challengeService := services.NewChallengeService(challengeRepo, submissionRepo)
	scoreboardService := services.NewScoreboardService(userRepo, submissionRepo, challengeRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	challengeHandler := handlers.NewChallengeHandler(challengeService)
	scoreboardHandler := handlers.NewScoreboardHandler(scoreboardService)

	// Public Routes - Authentication
	r.POST("/auth/register", authHandler.Register)
	r.POST("/auth/login", authHandler.Login)
	r.POST("/auth/logout", authHandler.Logout)
	r.GET("/auth/verify-email", authHandler.VerifyEmail)
	r.POST("/auth/verify-email", authHandler.VerifyEmail)
	r.POST("/auth/resend-verification", authHandler.ResendVerification)
	r.POST("/auth/forgot-password", authHandler.ForgotPassword)
	r.POST("/auth/reset-password", authHandler.ResetPassword)

	// Public Routes - Scoreboard
	r.GET("/scoreboard", scoreboardHandler.GetScoreboard)
	
	// Get current user info (checks cookie)
	r.GET("/auth/me", func(c *gin.Context) {
		tokenString, err := c.Cookie("auth_token")
		if err != nil || tokenString == "" {
			c.JSON(401, gin.H{"authenticated": false})
			return
		}
		
		// Parse token to get user info
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})
		
		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"authenticated": false})
			return
		}
		
		claims, _ := token.Claims.(jwt.MapClaims)
		c.JSON(200, gin.H{
			"authenticated": true,
			"user": gin.H{
				"id":       claims["user_id"],
				"username": claims["username"],
				"email":    claims["email"],
				"role":     claims["role"],
			},
		})
	})

	// Protected Routes
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// User Routes
		protected.POST("/auth/change-password", authHandler.ChangePassword)
		protected.GET("/challenges", challengeHandler.GetAllChallenges)
		protected.GET("/challenges/:id", challengeHandler.GetChallengeByID)
		protected.POST("/challenges/:id/submit", challengeHandler.SubmitFlag)

		// Admin Routes
		admin := protected.Group("/")
		admin.Use(middleware.AdminMiddleware())
		{
			admin.POST("/challenges", challengeHandler.CreateChallenge)
		}
	}

	return r
}
