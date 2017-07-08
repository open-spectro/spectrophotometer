
void processSpecificCommand(char* data, char* paramValue, Print* output) {
  switch (data[0]) {
    case 'a':
      rgbOn();
      break;
    case 'c':
      calibrate();
      break;
    case 'r':
      realExperiment();
      break;
    case 't':
      testAllColors();
      break;
    case 'v':
      simpleDiff();
      break;
  }
}

void printSpecificHelp(Print * output) {
  output->println(F("(a)ll rgb"));
  output->println(F("(c)alibrate"));
  output->println(F("(r)un experiment"));
  output->println(F("(t)est all colors"));
  output->println(F("le(v)el"));
}

