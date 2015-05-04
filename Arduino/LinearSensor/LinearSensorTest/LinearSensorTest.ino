// Parallel read of the linear sensor array TSL1402R (= the sensor with 256 photodiodes)
//-------------------------------------------------------------------------------------

// Define various ADC prescaler:
const unsigned char PS_32 = (1 << ADPS2) | (1 << ADPS0);
const unsigned char PS_128 = (1 << ADPS2) | (1 << ADPS1) | (1 << ADPS0);
int CLKpin = 8;    // <-- Arduino pin delivering the clock pulses to pin 3 (CLK) of the TSL1402R 
int SIpin = 7;     // <-- Arduino pin delivering the SI (serial-input) pulse to pin 2 of the TSL1402R 


#define AO_PIN1 A1
#define AO_PIN2 A2
#define INTEGRATION_TIME 20

#define REPEAT_ACQUISITION 50  // max value=63 !!!!
#define RED    11
#define GREEN   6
#define BLUE   13
#define UV     10
#define WHITE   9


byte LEDS[]={
  RED, GREEN, BLUE, WHITE, UV      };


void setup() 
{
  // Initialize two Arduino pins as digital output:
  pinMode(CLKpin, OUTPUT); 
  pinMode(SIpin, OUTPUT);  

  // To set up the ADC, first remove bits set by Arduino library, then choose 
  // a prescaler: PS_16, PS_32, PS_64 or PS_128:
  ADCSRA &= ~PS_128;  
  ADCSRA |= PS_32; // <-- Using PS_32 makes a single ADC conversion take ~30 us

  // Next, assert default setting:
  analogReference(DEFAULT);

  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(WHITE, OUTPUT);
  pinMode(UV, OUTPUT);

  Serial.begin(115200);
}

void loop() 
{  
  // testAllColors();
 // testGreenIntensity();
 fullOn();
}


void fullOn() {
  for (byte i=0; i<sizeof(LEDS); i++) {
    digitalWrite(LEDS[i], HIGH);
  }
}

void testAllColors() {
  for (byte i=0; i<sizeof(LEDS); i++) {
    unsigned int intArray[256]; // <-- the array where the readout of the photodiodes is stored, as integers
    byte channel=LEDS[i];
    int currentIntensity=autoIntensity(channel);
    acquire(intArray, channel);
    printResult(intArray, i, currentIntensity, false);
  }
}

void testGreenIntensity() {
  int intensity=256;
  for (byte i=0; i<5; i++) {
    unsigned int intArray[256]; // <-- the array where the readout of the photodiodes is stored, as integers
    byte channel=LEDS[1];
    if (i<4) {
      analogWrite(channel, intensity-1);
    } 
    else {
      analogWrite(channel, 0);
    }
    acquire(intArray, channel);
    printResult(intArray, i, intensity, false);
    intensity/=2;
  }
}






