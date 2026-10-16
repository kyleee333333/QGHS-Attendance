/*
  QGHS CONNECT — R307 UART connection test scaffold
  This is NOT a complete fingerprint enrollment/matching sketch.
  Confirm your exact R307 pinout, baud rate, and logic voltage from its datasheet.
  Never assume wire colors indicate pin function.
*/
#include <SoftwareSerial.h>

// Example for Arduino Uno only: sensor TX -> Arduino pin 2 (RX),
// sensor RX <- Arduino pin 3 (TX), and GND shared.
// Verify the module's voltage/logic requirements before wiring.
SoftwareSerial r307(2, 3); // Arduino RX, TX

void setup() {
  Serial.begin(115200);
  r307.begin(57600); // Common default on some modules; verify your unit.
  Serial.println("QGHS CONNECT R307 UART test scaffold");
  Serial.println("This sketch only relays serial bytes for diagnosis.");
  Serial.println("It does not enroll or match fingerprints.");
}

void loop() {
  while (r307.available()) Serial.write(r307.read());
  while (Serial.available()) r307.write(Serial.read());
}