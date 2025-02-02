// main.go

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Point represents a single coordinate point in the workout
type Point struct {
	X float64 `json:"x" bson:"x"`
	Y float64 `json:"y" bson:"y"`
}

// Workout represents the complete workout data
type Workout struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Points    []Point            `json:"points" bson:"points"`
	Timestamp time.Time          `json:"timestamp" bson:"timestamp"`
}

var workoutsCollection *mongo.Collection

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, relying on environment variables")
	}

	// MongoDB connection URI (get these values from .env file)
	username := os.Getenv("MONGO_USERNAME")
	password := os.Getenv("MONGO_PASSWORD")
	clusterURL := os.Getenv("MONGO_CLUSTER_URL")

	// MongoDB URI format
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/myFirstDatabase?retryWrites=true&w=majority", username, password, clusterURL)

	// Create a new MongoDB client
	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.Background(), clientOpts)
	if err != nil {
		log.Fatal(err)
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	// Get database and collection
	database := client.Database("main")

	// Create collection with schema validation
	jsonSchema := bson.M{
		"bsonType": "object",
		"required": []string{"points", "timestamp"},
		"properties": bson.M{
			"points": bson.M{
				"bsonType": "array",
				"minItems": 1,
				"items": bson.M{
					"bsonType": "object",
					"required": []string{"x", "y"},
					"properties": bson.M{
						"x": bson.M{
							"bsonType":    "double",
							"description": "x coordinate - must be a double/float",
						},
						"y": bson.M{
							"bsonType":    "double",
							"description": "y coordinate - must be a double/float",
						},
					},
				},
			},
			"timestamp": bson.M{
				"bsonType":    "date",
				"description": "timestamp of the workout",
			},
		},
	}

	validator := bson.M{
		"$jsonSchema": jsonSchema,
	}

	opts := options.CreateCollection().SetValidator(validator)

	// Create collection if it doesn't exist
	collections, _ := database.ListCollectionNames(ctx, bson.M{"name": "workouts"})
	if len(collections) == 0 {
		err = database.CreateCollection(ctx, "workouts", opts)
		if err != nil {
			log.Fatal(err)
		}
	}

	workoutsCollection = database.Collection("workouts")

	// Setup HTTP routes
	http.HandleFunc("/addWorkout", addWorkoutHandler)
	http.HandleFunc("/getWorkouts", getWorkoutsHandler)
	http.HandleFunc("/getWorkout", getWorkoutHandler)

	// Get port from environment variable or default to 4000
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	// Start HTTP server
	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func validateToken(r *http.Request) bool {
	token := r.Header.Get("Authorization")
	expectedToken := os.Getenv("REQ_TOKEN")
	return expectedToken != "" && token == expectedToken
}

func addWorkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	enableCors(&w)

	// Check for valid token
	if !validateToken(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var points []Point
	if err := json.NewDecoder(r.Body).Decode(&points); err != nil {
		http.Error(w, "Invalid request body: expected array of points", http.StatusBadRequest)
		return
	}

	// Validate that we received at least one point
	if len(points) == 0 {
		http.Error(w, "Workout must contain at least one point", http.StatusBadRequest)
		return
	}

	// Create workout document
	workout := Workout{
		Points:    points,
		Timestamp: time.Now(),
	}

	// Insert into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := workoutsCollection.InsertOne(ctx, workout)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the inserted ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id": result.InsertedID,
	})
}

func getWorkoutsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	enableCors(&w)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := workoutsCollection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var workouts []map[string]interface{}
	if err = cursor.All(ctx, &workouts); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workouts)
}

func getWorkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	enableCors(&w)

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid id format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var workout map[string]interface{}
	err = workoutsCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&workout)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workout)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
