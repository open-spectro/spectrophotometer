
// WE SHOULD PROBABLY USE AN EXISTING LIBRARY
// INTERESTING ONE: EXROM  http://www.arduino.cc/cgi-bin/yabb2/YaBB.pl?num=1264276992

// We want to save and load easily from EEPROM
#include <EEPROM.h>
#include <EXROM.h>


#define EE_PARAMETERS            140 // 32 bytes

#define EE_TARGET_EVENT_TYPES    224 // 32 bytes
#define EE_TARGET_EVENT_TIMES    256 // 128 bytes
#define EE_TARGET_EVENT_PARAMS   384 // 128 bytes


#define EEPROM_MIN_ADDR            0
#define EEPROM_MAX_ADDR          511

// code from http://www.arduino.cc/playground/Code/EepromUtil
void getStatusEEPROM(Print* output) {
  int bytesPerRow = 16;
  // address counter
  int i;

  // row bytes counter
  int j;

  // byte read from eeprom
  byte b;

  // temporary buffer for sprintf
  char buf[4];


  // initialize row counter
  j = 0;

  // go from first to last eeprom address
  for (i = EEPROM_MIN_ADDR; i <= EEPROM_MAX_ADDR; i++) {

    // if this is the first byte of the row,
    // start row by printing the byte address
    if (j == 0) {
      sprintf(buf, "%03X", i);
      output->print(buf);
      output->print(F(": "));
    }

    // read current byte from eeprom
    b = EEPROM.read(i);

    // write byte in hex form
    sprintf(buf, "%02X ", b);

    // increment row counter
    j++;

    // if this is the last byte of the row,
    // reset row counter and use println()
    // to start a new line
    if (j == bytesPerRow) {
      j = 0;
      output->println(buf);
      nilThdSleepMilliseconds(100);
    }
    // else just print the hex value with print()
    else {
      output->print(buf);
    }
  }
}


