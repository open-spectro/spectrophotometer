// we should make the spectrum for red, green, blue
// and get the maximal

void calibrate() {
  for (byte i=0; i<sizeof(RGB); i++) {
    unsigned int signalArray[ARRAY_SIZE]; // <-- the array where the readout of the photodiodes is stored, as integers
    unsigned int backgroundArray[ARRAY_SIZE];
    byte channel=RGB[i];
    int currentIntensity=autoIntensity(channel);
    acquire(signalArray, channel, REPEAT_CALIBRATE);
    analogWrite(channel, 0);
    acquire(backgroundArray, channel, REPEAT_CALIBRATE);
    diffArray(signalArray, backgroundArray);

    int maxPoint=getMax(signalArray, SMOOTH_CALIBRATE);
    switch (i) {
    case 0:
      pointRed=maxPoint;
      break;
    case 1:
      pointGreen=maxPoint;
      break;
    case 2:
      pointBlue=maxPoint;
      break;
    }
  }
}


