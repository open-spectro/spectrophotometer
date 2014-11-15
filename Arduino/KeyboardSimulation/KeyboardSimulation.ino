
void setup() {

  delay(10000);
  // make pin 2 an input and turn on the 
  // pullup resistor so it goes high unless
  // connected to ground:
  pinMode(2, INPUT_PULLUP);
  Keyboard.begin();
}

void loop() {
  for (int i=0; i<64; i++) {
    for (int j=65; j<92; j++) {
    Keyboard.write(j);
    delay(10);
    }
    Keyboard.write(13);
    Keyboard.write(10);
  }
  delay(120000);

}






