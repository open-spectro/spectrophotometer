// The maximal length of a parameter value. It is a int so the value must be between -32768 to 32767

#define SERIAL_BUFFER_LENGTH 32
char serialBuffer[SERIAL_BUFFER_LENGTH];
byte serialBufferPosition=0;

NIL_WORKING_AREA(waThreadSerial, 1400); // minimum 128
NIL_THREAD(ThreadSerial, arg) {

  Serial.begin(115200);
  while(true) {
    while (Serial.available()) {
      // get the new byte:
      char inChar = (char)Serial.read(); 

      if (inChar==13 || inChar==10) {
        // this is a carriage return;
        if (serialBufferPosition>0) {
          printResult(serialBuffer, &Serial);
        } 
        serialBufferPosition=0;
        serialBuffer[0]='\0';
      } 
      else {
        if (serialBufferPosition<SERIAL_BUFFER_LENGTH) {
          serialBuffer[serialBufferPosition]=inChar;
          serialBufferPosition++;
          if (serialBufferPosition<SERIAL_BUFFER_LENGTH) {
            serialBuffer[serialBufferPosition]='\0';
          }
        }
      }  
    }
    nilThdSleepMilliseconds(1);
  }
}



void printResult(char* data, Print* output) {
  boolean theEnd=false;
  byte paramCurrent=0; // Which parameter are we defining
  // The maximal length of a parameter value. It is a int so the value must be between -32768 to 32767
#define MAX_PARAM_VALUE_LENGTH 12
  char paramValue[MAX_PARAM_VALUE_LENGTH];
  byte paramValuePosition=0;
  byte i=0;

  while (!theEnd) {
    byte inChar=data[i];
    i++;
    if (inChar=='\0' || i==SERIAL_BUFFER_LENGTH) theEnd=true;
    if (inChar=='d') { // show debug info
      getDebuggerLog(output);
    } 
    else if (inChar=='f') { // show settings
      printFreeMemory(output);
    } 
    else if (inChar=='h') {
      serialPrintHelp(output);
    } 
    else if (inChar=='l') { // show log
      getLoggerLog(&Serial);
    } 
    else if (inChar=='s') { // show settings
      printParameters(output);
    }
    else if (inChar=='z') { // show debug info
      getStatusEEPROM(output);
    } 
    else if (inChar==',') { // store value and increment
      if (paramCurrent>0) {
        if (paramValuePosition>0) {
          setAndSaveParameter(paramCurrent-1,atoi(paramValue));
          output->println(parameters[paramCurrent-1]);
        } 
        else {
          output->println(parameters[paramCurrent-1]);
        }
        if (paramCurrent<=MAX_PARAM) {
          paramCurrent++;
          paramValuePosition=0;
          paramValue[0]='\0';
        } 
        else {
          debugger(1,inChar);
        }
      }
    }
    else if (theEnd) {
      if (data[0]=='r') {
        realExperiment();
      }
      else if (data[0]=='a') {
        rgbOn();
      }
      else if (data[0]=='c') {
        calibrate();
      }
      else if (data[0]=='g') {
        testGreenIntensity();
      }
      else if (data[0]=='t') {
        testAllColors();
      }
      else if (data[0]=='e') {
        if (paramValuePosition>0) {
          setTime(atol(paramValue));
        } 
        else {
          output->println(now());
        }
      }
      // this is a carriage return;
      else if (paramCurrent>0) {
        if (paramValuePosition>0) {
          setAndSaveParameter(paramCurrent-1,atoi(paramValue));
          output->println(parameters[paramCurrent-1]);
        } 
        else {
          output->println(parameters[paramCurrent-1]);
        }
      }      
    }
    else if ((inChar>47 && inChar<58) || inChar=='-') { // a number (could be negative)
      if (paramValuePosition<MAX_PARAM_VALUE_LENGTH) {
        paramValue[paramValuePosition]=inChar;
        paramValuePosition++;
        if (paramValuePosition<MAX_PARAM_VALUE_LENGTH) {
          paramValue[paramValuePosition]='\0';
        }
      }
    } 
    else if (inChar>64 && inChar<92) { // a character so we define the field
      // we extend however the code to allow 2 letters fields !!!
      // we extend however the code to allow 2 letters fields !!
      if (paramCurrent>0) {
        paramCurrent*=26;
      }
      paramCurrent+=inChar-64;
      if (paramCurrent>MAX_PARAM) {
        paramCurrent=0; 
      }
    } 
    if (theEnd) {
      output->println("");
    }
  }
}


void serialPrintHelp(Print* output) {
  output->println(F("(a)ll rgb"));
  output->println(F("(c)alibrate"));
  output->println(F("(g)reen intensity test"));  
  output->println(F("(r)un experiment"));
  output->println(F("(t)est all colors"));
  //  output->println(F("(d)ebug"));
  output->println(F("(e)poch"));
  output->println(F("(f)ree mem"));
  output->println(F("(h)elp"));
  //  output->println(F("(i)2c"));
  //  output->println(F("(l)og"));
  //  output->println(F("(q)ualifier"));
  output->println(F("(s)ettings"));
  output->println(F("(z) eeprom"));
}
























