type WeekBucket = {
  weekLabel: string;
  start: Date;
  end: Date;
};

function endOfCalendarWeek(date: Date): Date {
  // Monday-start week: 0=Sun,1=Mon,...,6=Sat
  const day = date.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const result = new Date(date);
  result.setDate(date.getDate() + daysUntilSunday);
  result.setHours(23, 59, 59, 999);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}


export function getFourWeekBuckets(periodStart: Date, periodEnd: Date): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  let cursor = new Date(periodStart);

  for (let i = 0; i < 4; i++) {
    const isLastBucket = i === 3;
    const weekEnd = isLastBucket
      ? new Date(periodEnd)
      : new Date(Math.min(endOfCalendarWeek(cursor).getTime(), periodEnd.getTime()));

    buckets.push({
      weekLabel: `Week ${i + 1}`,
      start: new Date(cursor),
      end: weekEnd,
    });

    cursor = addDays(weekEnd, 1);
  }

  return buckets;
}