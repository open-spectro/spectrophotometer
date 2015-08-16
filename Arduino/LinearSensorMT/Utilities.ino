

// function to print a device address
static void printFreeMemory(Print* output)
{
  nilPrintUnusedStack(output);
}


/* Functions to convert a number to hexadeciam */

const char hex[] = "0123456789ABCDEF";

uint8_t toHex(Print* output, byte value) {
  output->print(hex[value>>4&15]);
  output->print(hex[value>>0&15]);
  return value;
}

uint8_t toHex(Print* output, int value) {
  byte checkDigit=toHex(output, (byte)(value>>8&255));
  checkDigit^=toHex(output, (byte)(value>>0&255));
  return checkDigit;
}

uint8_t toHex(Print* output, long value) {
  byte checkDigit=toHex(output, (int)(value>>16&65535));
  checkDigit^=toHex(output, (int)(value>>0&65535));
  return checkDigit;
}

void clearArray(unsigned int intArray[]) {
  for(int i=0; i < 256; i++)
  {
    intArray[i]=0;
  }
}

int getMax(int unsigned intArray[], byte smoothing) {
  byte shift=floor(smoothing/2);
  int currentPoint=0;
  long currentMax=0;
  for (int i=shift; i<(ARRAY_SIZE-shift-1); i++) {
    long currentValue=0;
    for (int j=i-shift; j<=i+shift; j++) {
      currentValue+=intArray[j];
    }
    if (currentValue>currentMax) {
      currentMax=currentValue;
      currentPoint=i;
    }
  }
  return currentPoint;
}

Print* getOutput() {
  return &Serial; 
}


