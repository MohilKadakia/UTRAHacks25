// main.go

package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// MongoDB connection URI (get these values from .env file)
	username := os.Getenv("MONGO_USERNAME")
	password := os.Getenv("MONGO_PASSWORD")
	clusterURL := os.Getenv("MONGO_CLUSTER_URL") // Load cluster URL from .env file

	// MongoDB URI format
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/myFirstDatabase?retryWrites=true&w=majority", username, password, clusterURL)

	// Create a new MongoDB client
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	// List collections from the "test" database
	collections, err := client.Database("test").ListCollectionNames(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}

	// Print collection names
	fmt.Println("Collections:")
	for _, collection := range collections {
		fmt.Println(collection)
	}

	// Close the connection to MongoDB
	err = client.Disconnect(ctx)
	if err != nil {
		log.Fatal(err)
	}
}