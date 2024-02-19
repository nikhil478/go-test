// db/db.go
package db

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var (
	DB *gorm.DB
)

func Init() {
	var err error
	DB, err = gorm.Open("postgres", "host=localhost port=5432 user=myuser dbname=mydatabase password=mypassword sslmode=disable")
	if err != nil {
		panic("Failed to connect to database")
	}

	DB.AutoMigrate(&models.User{})
}
