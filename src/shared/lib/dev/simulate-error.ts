/**
 * 개발 환경에서 랜덤 에러를 시뮬레이션하는 유틸리티
 */

export class SimulatedError extends Error {
  constructor(message: string = '시뮬레이션된 에러입니다') {
    super(message);
    this.name = 'SimulatedError';
  }
}

interface SimulateErrorOptions {
  /**
   * 에러 발생 확률 (0-1 사이의 값)
   * @default 0.3 (30%)
   */
  probability?: number;

  /**
   * 에러 메시지
   * @default '시뮬레이션된 에러입니다'
   */
  message?: string;

  /**
   * 개발 환경에서만 작동할지 여부
   * @default true
   */
  devOnly?: boolean;

  /**
   * 에러 발생 전 지연 시간 (ms)
   * @default 0
   */
  delay?: number;
}

/**
 * 랜덤하게 에러를 발생시킵니다
 *
 * @example
 * // 30% 확률로 에러 발생
 * await simulateError();
 *
 * @example
 * // 50% 확률로 에러 발생
 * await simulateError({ probability: 0.5 });
 *
 * @example
 * // 1초 후 30% 확률로 에러 발생
 * await simulateError({ delay: 1000 });
 */
export async function simulateError(options: SimulateErrorOptions = {}): Promise<void> {
  const { probability = 0.3, message = '시뮬레이션된 에러입니다', devOnly = true, delay = 0 } = options;

  // 프로덕션 환경에서는 작동하지 않음
  if (devOnly && process.env.NODE_ENV === 'production') {
    return;
  }

  // 지연 시간이 있으면 대기
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // 확률에 따라 에러 발생
  if (Math.random() < probability) {
    throw new SimulatedError(message);
  }
}

/**
 * 함수를 래핑하여 랜덤하게 에러 발생
 *
 * @example
 * const riskyFetch = withSimulatedError(fetchData, { probability: 0.3 });
 * const data = await riskyFetch();
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSimulatedError<T extends (...args: any[]) => any>(fn: T, options: SimulateErrorOptions = {}): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    await simulateError(options);
    return fn(...args);
  }) as T;
}
