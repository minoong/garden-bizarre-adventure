'use client';

import { useInView as useInViewHook } from 'react-intersection-observer';
import type { ReactNode } from 'react';

export interface InViewProps {
  /**
   * 렌더링하고 관찰할 요소 또는 컴포넌트
   */
  children: ((inView: boolean, ref: (node?: Element | null) => void) => ReactNode) | ReactNode;

  /**
   * 교차 상태 변경 시 호출되는 콜백
   */
  onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;

  /**
   * 콜백을 한 번만 트리거할지 여부
   */
  triggerOnce?: boolean;

  /**
   * 트리거되기 전에 보여야 하는 비율 (0-1 사이의 값)
   */
  threshold?: number | number[];

  /**
   * 대상의 가시성을 확인하는 뷰포트로 사용되는 요소
   */
  root?: Element | Document | null;

  /**
   * root 주위의 여백
   */
  rootMargin?: string;

  /**
   * IntersectionObserver 생성을 건너뛸지 여부
   */
  skip?: boolean;

  /**
   * IntersectionObserver가 생성되기 전의 초기 inView 상태
   */
  initialInView?: boolean;

  /**
   * IntersectionObserver가 지원되지 않을 때의 대체 inView 값
   */
  fallbackInView?: boolean;
}

/**
 * react-intersection-observer를 위한 InView 컴포넌트 래퍼
 *
 * @example
 * // Render prop으로 사용
 * <InView>
 *   {(inView, ref) => (
 *     <div ref={ref}>
 *       {inView ? '보임' : '안보임'}
 *     </div>
 *   )}
 * </InView>
 *
 * @example
 * // onChange 콜백과 함께 사용
 * <InView onChange={(inView) => console.log('InView:', inView)}>
 *   <div>내용</div>
 * </InView>
 *
 * @example
 * // 한 번만 트리거
 * <InView triggerOnce>
 *   <div>지연 로드된 콘텐츠</div>
 * </InView>
 */
export function InView({
  children,
  onChange,
  triggerOnce = false,
  threshold = 0,
  root = null,
  rootMargin = '0px',
  skip = false,
  initialInView = false,
  fallbackInView = false,
}: InViewProps) {
  const { ref, inView } = useInViewHook({
    onChange,
    triggerOnce,
    threshold,
    root,
    rootMargin,
    skip,
    initialInView,
    fallbackInView,
  });

  if (typeof children === 'function') {
    return <>{children(inView, ref)}</>;
  }

  return <div ref={ref}>{children}</div>;
}
