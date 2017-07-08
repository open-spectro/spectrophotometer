#include <CapacitiveSensor.h>

/*
 * CapitiveSense Library Demo Sketch
 * Paul Badger 2008
 * Uses a high value resistor e.g. 10M between send pin and receive pin
 * Resistor effects sensitivity, experiment with values, 50K - 50M. Larger resistor values yield larger sensor values.
 * Receive pin is the sensor pin - try different amounts of foil/metal on this pin
 */

CapacitiveSensor   sensor1 = CapacitiveSensor(5,A3);        // 10M resistor between pins 4 & 2, pin 2 is sensor pin, add a wire and or foil if desired

CapacitiveSensor   sensor2 = CapacitiveSensor(5,A4);        // 10M resistor between pins 4 & 2, pin 2 is sensor pin, add a wire and or foil if desired


void setup()                    
{
  Serial.begin(115200);
  pinMode(13, OUTPUT);     
   pinMode(6, OUTPUT);   
}

long previous1=0;
long difference1=0;
long previous2=0;
long difference2=0;

void loop()                    
{
  long start = millis();

  long total1 =  sensor1.capacitiveSensor(50);
  difference1=total1-previous1;
  previous1=total1;

  long total2 =  sensor2.capacitiveSensor(50);
  difference2=total2-previous2;
  previous2=total2;

  Serial.print(millis() - start);        // check on performance in milliseconds
  Serial.print("\t");                    // tab character for debug windown spacing
  Serial.print(total1);                  // print sensor output 1
  Serial.print("\t");                    // tab character for debug windown spacing
  Serial.print(difference1);                  // print sensor output 1
  Serial.print("\t");                    // tab character for debug windown spacing
  Serial.print(total2);                  // print sensor output 1
  Serial.print("\t");                    // tab character for debug windown spacing
  Serial.println(difference2);                  // print sensor output 1
  if (total1>200) {
    digitalWrite(13, HIGH);
  } 
  else {
    digitalWrite(13, LOW);
  }
  if (total2>200) {
    digitalWrite(6, HIGH);
  } 
  else {
    digitalWrite(6, LOW);
  }
  delay(50);                             // arbitrary delay to limit data to serial port 
}


