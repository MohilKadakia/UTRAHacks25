#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Kalman.h> // Include Kalman filter library
#include <WiFi.h>
#include <WebServer.h>
#include "esp_wpa2.h"
#include <WiFiClientSecure.h>
WiFiClientSecure client;

static unsigned long lastDebounceTime = 0;
#define WIFI_SSID "eduroam"
#define EAP_IDENTITY "pujw@eva.eduroam.ca" 
#define EAP_PASSWORD "rbvnl"
const int MAX_READINGS = 100;  // Maximum number of readings to store
float angleXHistory[MAX_READINGS];
float angleYHistory[MAX_READINGS];

#define BUTTON_PIN 18  // Change this to your button pin
#define BUTTON_PIN2 19
#define BUZZER 33
#define DEBOUNCE_DELAY 50
WebServer server(80);
bool startWorkout = false;
volatile bool badPosture = false;
hw_timer_t * timer0 = NULL;
Adafruit_MPU6050 mpu;
Kalman kalmanX, kalmanY; // Kalman filter instances for X and Y

float angleX = 0;
float angleY = 0;
float initialAngleX = 0.0;
float initialAngleY = 0.0;
unsigned long lastTime = 0;
bool lastButtonState = HIGH; // For button debouncing
const char html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>ESP32 Gyroscope Data</title>
  <style>
    body {
      font-family: sans-serif;
      text-align: center;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    textarea {
      width: 50%;
      height: 50px;
      font-size: 1.2em;
      text-align: center;
      margin: 10px;
      resize: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>ESP32 Gyroscope Data</h1>
    <h3>Gyroscope X</h3>
    <textarea id="gyroX" readonly>0</textarea>
    <h3>Gyroscope Y</h3>
    <textarea id="gyroY" readonly>0</textarea>
  </div>
  <script>
    function updateGyroData() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/gyro', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          var data = JSON.parse(xhr.responseText);
          document.getElementById('gyroX').value = data.x;
          document.getElementById('gyroY').value = data.y;
        }
      };
      xhr.send();
    }
    setInterval(updateGyroData, 500); // Update every 500ms
  </script>
</body>
</html>
)rawliteral";
int currentIndex = 0;

void sendHttpsRequest() {
  const char* host = "utrahacks25.onrender.com"; // Server to connect to
  const int httpsPort = 443;

  // Skip SSL certificate validation
  client.setInsecure();

  if (!client.connect(host, httpsPort)) {
    Serial.println("Connection failed");
    return;
  }

  // Send GET request
  String url = "/addWorkout";  // URL path

String jsonBody = "{";
jsonBody += "\"type\": \"generic\", ";  // Set the workout type here
jsonBody += "\"points\": [";

for (int i = 0; i < currentIndex; i++) {
  if (i > 0) {
    jsonBody += ",";
  }
  jsonBody += "{";
  jsonBody += "\"x\": " + String(angleXHistory[i]) + ",";
  jsonBody += "\"y\": " + String(angleYHistory[i]);
  jsonBody += "}";
}

jsonBody += "]";  // End of points array
jsonBody += "}";  // End of body

  // Construct the POST request
  String request = String("POST /addWorkout HTTP/1.1\r\n") +
                  "Host: " + host + "\r\n" +
                  "Authorization: J5O7ehI93bzE\r\n" +
                  "Content-Type: application/json\r\n" +
                  "Content-Length: " + jsonBody.length() + "\r\n" +
                  "Connection: close\r\n\r\n" +
                  jsonBody;

  // Send the request
  client.print(request);

  // Wait for response
  while (!client.available()) {
    delay(100);
  }

  // Print response
  while (client.available()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
  }

  // Close the connection
  client.stop();
}

void IRAM_ATTR checkPosture() {
  if (startWorkout) {
    float deviation = abs(angleY - initialAngleY);
    if (deviation >= 30.0) {
      badPosture = true;
    } else {
      badPosture = false;
    }
  }
}

void storeAngles(float x, float y) {
    // Store the new readings
    angleXHistory[currentIndex] = x;
    angleYHistory[currentIndex] = y;
    
    // Increment index and wrap around if necessary
    currentIndex = (currentIndex + 1) % MAX_READINGS;
    
    //Serial.println(angleXHistory[currentIndex-1]);
    //Serial.println(angleYHistory[currentIndex-1]);
    // Print the stored values for debugging

}
 
void handleRoot() {
  server.send(200, "text/html", html);
}

void handleGyro() {
  float gyroX = angleX; // Replace with actual gyroscope X value
  float gyroY = angleY; // Replace with actual gyroscope Y value
  
  String json = "{";
  json += "\"x\":" + String(gyroX) + ",";
  json += "\"y\":" + String(gyroY);
  json += "}";
  
  server.send(200, "application/json", json);
}

void setup(void) {
  Serial.begin(115200);
  pinMode(BUTTON_PIN2, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);  // Set button pin as input with pullup
  WiFi.mode(WIFI_STA);
    esp_wifi_sta_wpa2_ent_set_identity((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
    esp_wifi_sta_wpa2_ent_set_username((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
    esp_wifi_sta_wpa2_ent_set_password((uint8_t *)EAP_PASSWORD, strlen(EAP_PASSWORD));
    esp_wifi_sta_wpa2_ent_enable();
  WiFi.begin(WIFI_SSID);
  Serial.print("Connecting To WiFi Network .");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  // Connected Successfully
  Serial.println("\nConnected To The WiFi Network");
  Serial.print("Local ESP32 IP: ");
  Serial.println(WiFi.localIP());
    // Initialize MPU6050
    if (!mpu.begin()) {
        Serial.println("Failed to find MPU6050 chip");
        while (1) { delay(10); }
    }
    Serial.println("MPU6050 Found!");

    // Configure MPU6050 settings
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);

    // Initialize Kalman filter
    kalmanX.setAngle(0);
    kalmanY.setAngle(0);
    lastTime = millis();
    timer0 = timerBegin(0, 80, true);  // Timer 0, prescaler 80, count up
    timerAttachInterrupt(timer0, &checkPosture, true);  // Edge trigger
    timerAlarmWrite(timer0, 1000000, true);  // 1 second interval
    timerAlarmEnable(timer0);  // Initialize timing
    server.on("/", handleRoot);
    server.on("/gyro", handleGyro);
    server.begin();
}

void loop() {
  server.handleClient();
  sensors_event_t accel, gyro, temp;

  if (badPosture && startWorkout) {
    digitalWrite(BUZZER, HIGH);
    delay(200);  // Short beep
    digitalWrite(BUZZER, LOW);
    delay(200);
  }
  bool btn = digitalRead(BUTTON_PIN2);
  if (btn == HIGH) {
    Serial.println("Pressed");
    lastDebounceTime = millis();
    if (startWorkout) {
      Serial.println("Sending data");
      sendHttpsRequest();
      delay(1000);
      startWorkout = false;
    } else {
      Serial.println("Starting");
      startWorkout = true;
      mpu.getEvent(&accel, &gyro, &temp);

      for (int x=0; x<5; x++){
        unsigned long currentTime = millis();
        float dt = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        // Compute accelerometer angles
        float accAngleX = atan2(accel.acceleration.y, accel.acceleration.z) * RAD_TO_DEG;
        float accAngleY = atan2(-accel.acceleration.x, accel.acceleration.z) * RAD_TO_DEG;
        
        float gyroX = gyro.gyro.x * RAD_TO_DEG;
        float gyroY = gyro.gyro.y * RAD_TO_DEG;

        // Apply Kalman filter
        initialAngleX = kalmanX.getAngle(accAngleX, gyroX, dt);
        initialAngleY = kalmanY.getAngle(accAngleY, gyroY, dt);
        digitalWrite(BUZZER, HIGH);
        delay(1000);
        digitalWrite(BUZZER, LOW);
        delay(1000);
      }
      
      Serial.println("Initial X:");
      Serial.print(initialAngleX);
      Serial.println("Initial Y:");
      Serial.print(initialAngleY);
    }
  } else if (startWorkout) {

      Serial.println("Reading data");
      // Read button state with debouncing
      bool currentButtonState = digitalRead(BUTTON_PIN);

      // Update sensor readings

      mpu.getEvent(&accel, &gyro, &temp);

      unsigned long currentTime = millis();
      float dt = (currentTime - lastTime) / 1000.0;
      lastTime = currentTime;

      // Compute accelerometer angles
      float accAngleX = atan2(accel.acceleration.y, accel.acceleration.z) * RAD_TO_DEG;
      float accAngleY = atan2(-accel.acceleration.x, accel.acceleration.z) * RAD_TO_DEG;
      
      float gyroX = gyro.gyro.x * RAD_TO_DEG;
      float gyroY = gyro.gyro.y * RAD_TO_DEG;

      // Apply Kalman filter
      angleX = kalmanX.getAngle(accAngleX, gyroX, dt);
      angleY = kalmanY.getAngle(accAngleY, gyroY, dt);
      storeAngles(angleX, angleY);

      Serial.println(angleX);
      Serial.println(angleY);

      lastButtonState = currentButtonState;
      delay(2000); // Small delay for stability
      
    
  } else {
    // No workout, so we don't have to do anything right now
  }
    

}