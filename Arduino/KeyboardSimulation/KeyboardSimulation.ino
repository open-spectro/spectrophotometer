
void setup() {

  delay(10000);
  // make pin 2 an input and turn on the 
  // pullup resistor so it goes high unless
  // connected to ground:
  // pinMode(2, INPUT_PULLUP);
  Keyboard.begin();
}

int waitTime=500;

void loop() {
  for (int i=0; i<8; i++) {
    for (int j=0; j<10; j++) {
      Keyboard.print(12345);
      delay(waitTime);
    }

    /*
    for (int j=32; j<127; j++) {
     Keyboard.press(j);
     delay(waitTime);
     Keyboard.release(j);
     delay(waitTime);
     }
     */
    Keyboard.press(13);
    delay(waitTime);
    Keyboard.release(13);
    delay(waitTime);
    Keyboard.press(10);
    delay(waitTime);
    Keyboard.release(10);
    delay(waitTime);
    delay(500);
  }
  delay(120000);

}









