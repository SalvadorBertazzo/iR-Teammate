package main

import (
	"iR-Teammate/internal/config"
	"iR-Teammate/internal/server"
	"log"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	log.Println("Config loaded successfully")

	dependencies, err := server.Setup(config)
	if err != nil {
		log.Fatal("Failed to setup dependencies: ", err)
	}
	defer dependencies.Close()
	log.Println("Dependencies setup successfully")

	if err := server.Start(dependencies); err != nil {
		log.Fatal("Server error: ", err)
	}
	log.Println("Server started successfully")
}
