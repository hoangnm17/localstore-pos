export const toMin = (time) => {
  if (!time) return null;

  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const toTime = (totalMin) => {
  let min = totalMin;

  while (min < 0) {
    min += 1440;
  }

  while (min >= 1440) {
    min -= 1440;
  }

  const hour = Math.floor(min / 60);
  const minute = min % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const startMin = toMin(startTime);
  const endMin = toMin(endTime);

  let duration = endMin - startMin;

  if (endMin < startMin) {
    duration += 1440;
  }

  return duration;
};

export const getDiff = (time1, time2) => {
  if (!time1 || !time2) return null;

  const min1 = toMin(time1);
  const min2 = toMin(time2);

  let diff = min1 - min2;

  if (diff < -720) diff += 1440;
  if (diff > 720) diff -= 1440;

  return diff;
};