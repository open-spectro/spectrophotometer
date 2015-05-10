#define THR_ACTION1 1

#ifdef THR_ACTION1

NIL_WORKING_AREA(waThreadAction1, 0);
NIL_THREAD(ThreadAction1, arg) {

  byte action1Step=0;
  while (TRUE) {
    analogWrite(LEDS[action1Step%4], 0);
    action1Step++;
    analogWrite(LEDS[action1Step%4], 255);
    nilThdSleepMilliseconds(250);
  }
}

#endif






