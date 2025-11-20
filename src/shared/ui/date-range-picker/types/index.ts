import type { Dayjs } from 'dayjs';

export interface DateRange {
  from: Dayjs | null;
  to: Dayjs | null;
}

export interface DateRangePickerProps {
  /**
   * 날짜 범위 값
   */
  value?: DateRange;

  /**
   * 날짜 범위 변경 콜백
   */
  onChange?: (range: DateRange) => void;

  /**
   * 시작일 레이블
   * @default "시작일"
   */
  fromLabel?: string;

  /**
   * 종료일 레이블
   * @default "종료일"
   */
  toLabel?: string;

  /**
   * 모달 제목
   * @default "날짜 범위 선택"
   */
  modalTitle?: string;

  /**
   * 날짜 포맷
   * @default "YYYY-MM-DD"
   */
  dateFormat?: string;

  /**
   * 최소 선택 가능한 날짜
   */
  minDate?: Dayjs;

  /**
   * 최대 선택 가능한 날짜
   */
  maxDate?: Dayjs;

  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;

  /**
   * 필수 입력 여부
   * @default false
   */
  required?: boolean;

  /**
   * 에러 메시지
   */
  error?: string;

  /**
   * 도움말 텍스트
   */
  helperText?: string;

  /**
   * Input 전체 너비 사용
   * @default false
   */
  fullWidth?: boolean;
}
