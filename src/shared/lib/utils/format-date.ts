import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export function formatDistanceToNow(date: Date | string): string {
  return dayjs(date).fromNow();
}
