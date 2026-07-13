export const formatDate = (
  dateString?: string | null,
  locale: string = 'ko',
) => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  if (locale.toLowerCase().startsWith('en')) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h12',
    }).format(date);
  }

  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const weekday = getPart('weekday');
  const hour = Number(getPart('hour'));
  const minute = getPart('minute');

  if (!year || !month || !day || !weekday || Number.isNaN(hour) || !minute) {
    return '-';
  }

  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;

  return `${year}년 ${month}월 ${day}일 (${weekday}) ${period} ${displayHour}:${minute}`;
};
