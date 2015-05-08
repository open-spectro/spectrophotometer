
// &JKLMNOPQR
//  jklmnopqr
void printCompressed(unsigned int intArray[]) {
  for (int i=0; i<256; i++) {
    if (i%16 == 0) {
      Serial.print(intArray[i]);
    } 
    else {
      // we will store the difference
      long diff=intArray[i]-intArray[i-1];
      // need to get the first digit with the sign
      Serial.print(" ");
      compress(&Serial, diff);
    }
    if (i%16 == 15) {
      Serial.println("");
    }
  }
}

void printNormal(unsigned int intArray[], boolean printId) {
  for(int i = 0; i < 256; i++)
  {
    if (printId) {
      if (i<10) Serial.print(" ");
      if (i<100) Serial.print(" ");
      Serial.print(i);
      Serial.print(" : ");
    }
    if (intArray[i]<10) Serial.print(" ");
    if (intArray[i]<100) Serial.print(" ");
    if (intArray[i]<1000) Serial.print(" ");
    if (intArray[i]<10000) Serial.print(" ");
    if (intArray[i]<100000) Serial.print(" ");
    Serial.print(intArray[i]);

    if (i%16 == 15) {
      Serial.println("");
    }
  }
}

// %JKLMNOPQR
//  jklmnopqr
char encoding[]={
  'r','q','p','o','n','m','l','k','j','%','J','K','L','M','N','O','P','Q','R'};

void compress(Print* output, long value) {
  byte nbDigits=floor(log10(abs(value)));
  int firstDigit=value/(pow(10,nbDigits));
  int rest=abs(value-firstDigit*pow(10,nbDigits));
  byte nbDigitsRest=log10(abs(rest));
  output->print(encoding[firstDigit+9]);
  if (nbDigits>0) {
    for (byte j=1; j<(nbDigits-nbDigitsRest); j++) {
      output->print("0"); 
    }
    output->print(rest);
  }
}

void printResult(unsigned int intArray[], byte channel, int currentIntensity, boolean printId, boolean compressed) {

  Serial.print("-----> ");
  Serial.print(channel);
  Serial.print(" - Intensity:");
  Serial.println(currentIntensity);

  // Next, send the measurement stored in the array to host computer using serial (rs-232).
  // communication. This takes ~80 ms during whick time no clock pulses reaches the sensor. 
  // No integration is taking place during this time from the photodiodes as the integration 
  // begins first after the 18th clock pulse after a SI pulse is inserted:
  if (compressed) {
    printCompressed(intArray); 
  } 
  else {
    printNormal(intArray, printId); 
  }
  Serial.println(""); // <-- Send a linebreak to indicate the measurement is transmitted.
}








