#include <CapacitiveSensor.h>

/*
 * CapitiveSense Library Demo Sketch
 * Paul Badger 2008
 * Uses a high value resistor e.g. 10M between send pin and receive pin
 * Resistor effects sensitivity, experiment with values, 50K - 50M. Larger resistor values yield larger sensor values.
 * Receive pin is the sensor pin - try different amounts of foil/metal on this pin
 */


CapacitiveSensor   cs_3_2 = CapacitiveSensor(3,2);        // 10M resistor between pins 4 & 2, pin 2 is sensor pin, add a wire and or foil if desired

void setup()                    
{
  Serial.begin(115200);
  pinMode(13, OUTPUT);     
}

long previous=0;
long difference=0;

void loop()                    
{
  long start = millis();

  long total =  cs_3_2.capacitiveSensor(200);

  difference=total-previous;
  previous=total;

  Serial.print(millis() - start);        // check on performance in milliseconds
  Serial.print("\t");                    // tab character for debug windown spacing
  Serial.print(total);                  // print sensor output 1
  Serial.print("\t");                    // tab character for debug windown spacing
  Serial.println(difference);                  // print sensor output 1
  if (total>25) {
    digitalWrite(13, HIGH);
  } 
  else {
    digitalWrite(13, LOW);
  }
  delay(200);                             // arbitrary delay to limit data to serial port 
}


