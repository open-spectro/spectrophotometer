/*
  Blink
 Turns on an LED on for one second, then off for one second, repeatedly.
 
 This example code is in the public domain.
 */

// Pin 13 has an LED connected on most Arduino boards.
// give it a name:
int led = 13;

// the setup routine runs once when you press reset:
void setup() {                
  // initialize the digital pin as an output.
  Serial.begin(9600);   
}

// the loop routine runs over and over again forever:

long values[]={
  0,1,10,16,100,500,1234,789,65000,-10,-105,-5002,-92122};

// %JKLMNOPQR
//  jklmnopqr
char encoding[]={
  'r','q','p','o','n','m','l','k','j','%','J','K','L','M','N','O','P','Q','R'};

void compress(long value) {
  byte nbDigits=floor(log10(abs(value)));
  int firstDigit=value/(pow(10,nbDigits));
  long rest=abs(value-firstDigit*pow(10,nbDigits));
  byte nbDigitsRest=log10(abs(rest));
  Serial.print(encoding[firstDigit+9]);
  if (nbDigits>0) {
    for (byte j=1; j<(nbDigits-nbDigitsRest); j++) {
      Serial.print("0"); 
    }
    Serial.print(rest);
  }
}

void debug(int value) {
  byte nbDigits=floor(log10(abs(value)));
  Serial.print(nbDigits);
  int firstDigit=value/(pow(10,nbDigits));
  Serial.print(" - First digit: ");
  Serial.print(firstDigit);
  int rest=abs(value-firstDigit*pow(10,nbDigits));
  Serial.print(" - Rest: ");
  Serial.print(rest);
  byte nbDigitsRest=log10(abs(rest));
  Serial.print(" - Nb digits rest: ");
  Serial.print(nbDigitsRest);

  Serial.print(" - Encoded: ");
  Serial.print(encoding[firstDigit+9]);
  // we need to add missing leading 0 !!!!!


  if (nbDigits>0) {
    for (byte j=1; j<(nbDigits-nbDigitsRest); j++) {
      Serial.print("0"); 
    }
    Serial.print(rest);
  }
}

void loop() {
  delay(5000);
  for (byte i=0; i<(sizeof(values)/4); i++) {
    long value=values[i];
  Serial.print(value);
  Serial.print(" - ");
  compress(value);
    Serial.println("");
  }
  delay(100000);
}


