

void setupActions() {

}

void fullOn() {
  for (byte i=0; i<sizeof(LEDS); i++) {
    analogWrite(LEDS[i], 255);
  }
}

void fullOff() {
  for (byte i=0; i<sizeof(LEDS); i++) {
    analogWrite(LEDS[i], 0);
  }
}


void rgbOn() {
  fullOff();
  Print* output=getOutput();
  unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
  unsigned int backgroundArray[ARRAY_SIZE];
  analogWrite(RED, getParameter(PARAM_RED_INTENSITY));
  analogWrite(GREEN, getParameter(PARAM_GREEN_INTENSITY));
  analogWrite(BLUE, getParameter(PARAM_BLUE_INTENSITY));
  acquire(signalArray);
  analogWrite(RED, 0);
  analogWrite(GREEN, 0);
  analogWrite(BLUE, 0);
  acquire(backgroundArray);
  diffArray(signalArray, backgroundArray);
  printResult(output, signalArray, backgroundArray, 7, getParameter(PARAM_RED_INTENSITY));
}



void testAllColors() {
  fullOff();
  Print* output=getOutput();
  for (byte i=0; i<sizeof(LEDS); i++) {
    unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
    unsigned int backgroundArray[ARRAY_SIZE];
    byte channel=LEDS[i];
    int currentIntensity=autoIntensity(channel);
    acquire(signalArray);
    analogWrite(channel, 0);
    acquire(backgroundArray);
    diffArray(signalArray, backgroundArray);
    printResult(output, signalArray, backgroundArray, i, currentIntensity);
  }
}

void realExperiment() {
  fullOff();
  Print* output=getOutput();
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

  acquire(signalArray);
  analogWrite(WHITE, 0);
  acquire(backgroundArray);
  diffArray(signalArray, backgroundArray);
  printResult(output, signalArray, backgroundArray, 5, currentIntensity);

  for (int i=0; i<10; i++) {
    analogWrite(GREEN, 255);
    delay(500);
    analogWrite(GREEN, 0);
    delay(500);
  }

  analogWrite(WHITE, currentIntensity-1);
  acquire(signalArray);
  analogWrite(WHITE, 0);
  acquire(backgroundArray);
  diffArray(signalArray, backgroundArray);
  printResult(output, signalArray, backgroundArray, 6, currentIntensity);
}


void testGreenIntensity() {
  fullOff();
  Print* output=getOutput();
  int intensity=256;
  for (byte i=0; i<6; i++) {
    unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
    unsigned int backgroundArray[ARRAY_SIZE];
    byte channel=GREEN;
    analogWrite(channel, intensity-1);
    acquire(signalArray);
    analogWrite(channel, 0);
    acquire(backgroundArray);
    diffArray(signalArray, backgroundArray);
    printResult(&Serial, signalArray, backgroundArray, 1, intensity);
    intensity/=2;
  }
}






