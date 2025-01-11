// Generates values to be used with the convars "tv_listen_voice_indices"/"tv_listen_voice_indices_h" (CS2 only).
// It's a bitmap split into two 32-bit values where each bit represents a user id (low 0 to 31 and high 32 to 63).
// We have to turn on the bit for each user id that we want to listen to. Example:
// [1, 3, 7] => 1000101
export function generatePlayerVoicesValues(userIds: number[]) {
  let valueLow = 0;
  let valueHigh = 0;
  for (const userId of userIds) {
    if (userId >= 0 && userId < 32) {
      valueLow = valueLow | (1 << userId);
    } else if (userId >= 32 && userId < 64) {
      valueHigh = valueHigh | (1 << (userId - 32));
    }
  }

  return { valueLow, valueHigh };
}
