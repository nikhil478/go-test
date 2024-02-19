// main.go
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nikhil478/go-test/auth"
	"github.com/nikhil478/go-test/db"
	"github.com/nikhil478/go-test/model"
)

func main() {
	r := gin.Default()

	// Initialize the database
	db.Init()

	// Define API routes
	api := r.Group("/api")
	{
		api.POST("/register", register)
		api.POST("/login", login)
	}

	r.Run(":8080")
}

func register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := auth.HashPassword(user.Password)
	if err != nil {
		c.JSON(500, gin.H{"error": "Internal Server Error"})
		return
	}

	user.Password = hashedPassword
	db.DB.Create(&user)
	c.JSON(200, gin.H{"message": "User registered successfully"})
}

func login(c *gin.Context) {
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := db.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	if !auth.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(200, gin.H{"message": "Login successful"})
}
