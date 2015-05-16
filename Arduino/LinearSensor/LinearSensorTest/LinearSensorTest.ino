


#define ARRAY_SIZE 256
#define AVERAGE 0

#define AO_PIN1 A1
#define AO_PIN2 A2
#define INTEGRATION_TIME 20

#define REPEAT_ACQUISITION 63  // max value=63 !!!!
#define REPEAT_CALIBRATE  10  // max value=63 !!!!
#define SMOOTH_CALIBRATE  15  // max value=63 !!!!
#define RED    11
#define GREEN   6
#define BLUE   13
#define UV     10
#define WHITE   9

#define CLKpin  8    // <-- Arduino pin delivering the clock pulses to pin 3 (CLK) of the TSL1402R 
#define SIpin   7     // <-- Arduino pin delivering the SI (serial-input) pulse to pin 2 of the TSL1402R 


byte RGB[]={
  RED, GREEN, BLUE};
byte LEDS[]={
  RED, GREEN, BLUE, WHITE, UV      };
char INFO[]={
  'R','G','B','W','U','Z','E' }; // E: experiment, Z: reference

byte pointRed=0;
byte pointGreen=0;
byte pointBlue=0;

void setup() 
{
  delay(5000);
  Keyboard.begin();
  Serial.begin(115200);

initLinear();

  // Next, assert default setting:
  analogReference(DEFAULT);

  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(WHITE, OUTPUT);
  pinMode(UV, OUTPUT);
}

void loop() 
{  
  calibrate();

  // realExperiment();

  //testAllColors();
   testGreenIntensity();
  // fullOn();

}


void fullOn() {
  for (byte i=0; i<sizeof(LEDS); i++) {
    digitalWrite(LEDS[i], HIGH);
  }
}

void testAllColors() {
  for (byte i=0; i<sizeof(LEDS); i++) {
    unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
    unsigned int backgroundArray[ARRAY_SIZE];
    byte channel=LEDS[i];
    int currentIntensity=autoIntensity(channel);
    acquire(signalArray, channel);
    analogWrite(channel, 0);
    acquire(backgroundArray, channel);
    diffArray(signalArray, backgroundArray);
    printResult(&Serial, signalArray, backgroundArray, i, currentIntensity, AVERAGE);
  }
}

void realExperiment() {
  // we will use the white led
  // we make a spectrum
  unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
  unsigned int backgroundArray[ARRAY_SIZE];

  for (int i=0; i<10; i++) {
    analogWrite(BLUE, 255);
    delay(500);
    analogWrite(BLUE, 0);
    delay(500);
  }

  int currentIntensity=autoIntensity(WHITE);
  acquire(signalArray, WHITE);
  analogWrite(WHITE, 0);
  acquire(backgroundArray, WHITE);
  diffArray(signalArray, backgroundArray);
  printResult(&Serial, signalArray, backgroundArray, 5, currentIntensity, AVERAGE);

  for (int i=0; i<10; i++) {
    analogWrite(GREEN, 255);
    delay(500);
    analogWrite(GREEN, 0);
    delay(500);
  }

  analogWrite(WHITE, currentIntensity-1);
  acquire(signalArray, WHITE);
  analogWrite(WHITE, 0);
  acquire(backgroundArray, WHITE);
  diffArray(signalArray, backgroundArray);
  printResult(&Serial, signalArray, backgroundArray, 6, currentIntensity, AVERAGE);

}


void testGreenIntensity() {
  int intensity=256;
  for (byte i=0; i<6; i++) {
    unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
    unsigned int backgroundArray[ARRAY_SIZE];
    byte channel=GREEN;
    analogWrite(channel, intensity-1);
    acquire(signalArray, channel);
    analogWrite(channel, 0);
    acquire(backgroundArray, channel);
    diffArray(signalArray, backgroundArray);
    printResult(&Serial, signalArray, backgroundArray, 1, intensity, AVERAGE);
    intensity/=2;
  }
}

