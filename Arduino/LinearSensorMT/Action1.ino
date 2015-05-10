// #define THR_ACTION1 1

#ifdef THR_ACTION1

NIL_WORKING_AREA(waThreadAction1, 100);
NIL_THREAD(ThreadAction1, arg) {

  int action1Step=0;


  pinMode(OUT4, OUTPUT);
  pinMode(RED1, OUTPUT);
  pinMode(GREEN1, OUTPUT);
  pinMode(BLUE1, OUTPUT);

  digitalWrite(OUT4, HIGH);

  setParameter(PARAM_SERVO_ACTIVE,1);

  while (TRUE) {

    if ((getParameter(PARAM_DETECTOR1)==1) || (action1Step>0)) {
      action1Step++;
    }

    if (action1Step==getParameter(PARAM_DELAY0)) {
      playAudio();
    }

    if (action1Step==getParameter(PARAM_DELAY1)) {
      digitalWrite(OUT4, HIGH);
      digitalWrite(RED1, LOW);
      digitalWrite(GREEN1, LOW);
      digitalWrite(BLUE1, LOW);
    }

    if (action1Step==getParameter(PARAM_DELAY2)) {
      digitalWrite(OUT4, LOW);
      digitalWrite(RED1, HIGH);
      digitalWrite(GREEN1, HIGH);
      digitalWrite(BLUE1, HIGH);
    }



    if (getParameter(PARAM_DELAY9)==action1Step) {
      action1Step=0;
          digitalWrite(OUT4, HIGH);
      digitalWrite(RED1, LOW);
      digitalWrite(GREEN1, LOW);
      digitalWrite(BLUE1, LOW);
      stopAudio();
    }

    setParameter(PARAM_ACTION1, action1Step);
    nilThdSleepMilliseconds(40);
  }
}

#endif





