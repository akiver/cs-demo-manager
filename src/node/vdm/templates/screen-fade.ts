export function screenFade(index: number, startTick: number) {
  return `
  "${index}"
  {
    factory "ScreenFadeStart"
    name "ScreenFadeStart${index}"
    starttick "${startTick}"
    duration "1.000"
    holdtime "1.000"
    FFADE_IN "1"
    FFADE_OUT "1"
    r "0"
    g "0"
    b "0"
    a "255"
  }`;
}
