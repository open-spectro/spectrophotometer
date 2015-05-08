
void clockPulse()
{
  delayMicroseconds(1);
  digitalWrite(CLKpin, HIGH);
  delayMicroseconds(1);
  digitalWrite(CLKpin, LOW);
}

void resetClockPulse() {
  delayMicroseconds(1);
  digitalWrite(SIpin, HIGH);
  delayMicroseconds(1);
  digitalWrite(CLKpin, HIGH);
  delayMicroseconds(1);
  digitalWrite(SIpin, LOW);
  delayMicroseconds(1);
  digitalWrite(CLKpin, LOW);
}


