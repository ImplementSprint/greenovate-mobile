export type BranchApiRecord = {
  id: number;
  name: string;
  address: string;
  phone?: string;
  opening_time: string;
  closing_time: string;
  is_active?: boolean;
};

export type Branch = BranchApiRecord & {
  hours: string;
  isOpenNow: boolean;
};

const BRANCH_TIME_ZONE = 'Asia/Manila';

const parseClock = (value: string) => {
  const [hourText = '0', minuteText = '0'] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return 0;
  }

  return hour * 60 + minute;
};

const getCurrentMinutesInBranchTimeZone = () => {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: BRANCH_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

    if (Number.isFinite(hour) && Number.isFinite(minute)) {
      return hour * 60 + minute;
    }
  } catch {
    // Fallback to device-local time if Intl timezone support is unavailable.
  }

  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const isBranchOpenNow = (branch: Pick<BranchApiRecord, 'opening_time' | 'closing_time'>) => {
  const currentMinutes = getCurrentMinutesInBranchTimeZone();
  const openingMinutes = parseClock(branch.opening_time);
  const closingMinutes = parseClock(branch.closing_time);

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (closingMinutes < openingMinutes) {
    return currentMinutes >= openingMinutes || currentMinutes <= closingMinutes;
  }

  return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
};

export const normalizeBranch = (branch: BranchApiRecord): Branch => ({
  ...branch,
  hours: `${branch.opening_time} - ${branch.closing_time}`,
  isOpenNow: isBranchOpenNow(branch),
});
