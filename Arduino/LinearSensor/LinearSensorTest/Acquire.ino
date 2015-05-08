
unsigned int acquireOne(unsigned int intArray[], boolean append) {
  unsigned int currentMax=0;
  delay(INTEGRATION_TIME);
  resetClockPulse();
  for(int i = 0; i < 128; i++)
  {
    unsigned int currentValue=analogRead(AO_PIN1);
    if (currentValue>currentMax) currentMax=currentValue;
    if (append) {
      intArray[i] += currentValue;
    }
    currentValue=analogRead(AO_PIN2);
    if (currentValue>currentMax) currentMax=currentValue;
    if (append) {
      intArray[i+128] += currentValue;
    }    
    clockPulse();
  }
  return currentMax;
}

int autoIntensity(int channel) {
  int intensity=256;
  int currentMax;
  do {
    analogWrite(channel, intensity-1);
    acquireOne(NULL, false);
    currentMax=acquireOne(NULL, false);
    if (currentMax>900) {
      intensity/=2;
    }
  } 
  while (currentMax>900 && intensity>15);
  return intensity;
}


void acquire(unsigned int intArray[], int channel) {
  clearArray(intArray);
  acquireOne(intArray, false);   // an empty cycle
  for (int counter=0; counter<REPEAT_ACQUISITION; counter++) {
    acquireOne(intArray, true);
  }
  
  analogWrite(channel, 0);
}














