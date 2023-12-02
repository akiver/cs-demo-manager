export function textMessage(index: number, startTick: number, message: string) {
  return `
  "${index}"
  {
    factory "TextMessageStart"
    name "TextMessageStart${index}"
    starttick "${startTick}"
    message "${message}"
    font "Trebuchet24"
    fadein "0.500"
    fadeout "0.500"
    holdtime "5.000"
    fxtime "0.000"
    FADEINOUT "1"
    x "10.000000"
    y "10.000000"
    r1 "255"
    g1 "255"
    b1 "255"
    a1 "0"
    r2 "0"
    g2 "0"
    b2 "0"
    a2 "0"
  }`;
}
