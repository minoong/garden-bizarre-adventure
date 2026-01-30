import { useCallback, useEffect, useRef, useState } from 'react';

type ScrollDirection = 'UP' | 'DOWN';

interface UseSpyElemOptions {
  /** 요소의 높이 (px) */
  elemHeight: number;
  /** 스크롤 임계값. 이 값 이상 스크롤해야 헤더가 숨겨짐 (기본값: 100) */
  threshold?: number;
}

/**
 * 스크롤 방향에 따라 요소를 숨기거나 보여주는 훅
 * @param options - 설정 옵션
 * @returns ref와 marginTop 값
 */
export const useSpyElem = (
  options: UseSpyElemOptions | number,
): {
  ref: React.RefObject<HTMLElement | null>;
  marginTop: number;
} => {
  // 이전 버전과의 호환성을 위한 처리
  const config = typeof options === 'number' ? { elemHeight: options, threshold: 100 } : { threshold: 100, ...options };

  const { elemHeight, threshold = 100 } = config;

  // 요소 참조
  const ref = useRef<HTMLElement>(null);

  // 요소의 marginTop 상태
  const [marginTop, setMarginTop] = useState(0);

  // 이전 스크롤 위치와 방향 추적
  const prevScrollTop = useRef(0);
  const prevDirection = useRef<ScrollDirection>('DOWN');

  // 스크롤 방향 전환 지점
  const transitionPoint = useRef(elemHeight);

  /**
   * 현재 스크롤 위치를 안전하게 가져오는 함수
   */
  const getScrollTop = useCallback((): number => {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }, []);

  /**
   * 스크롤 이벤트 핸들러
   */
  const handleScroll = useCallback(() => {
    const currentScrollTop = getScrollTop();

    // 스크롤이 임계값 미만이면 항상 헤더를 보여줌
    if (currentScrollTop < threshold) {
      setMarginTop(0);
      prevScrollTop.current = currentScrollTop;
      return;
    }

    // 스크롤 방향 계산
    const currentDirection: ScrollDirection = prevScrollTop.current > currentScrollTop ? 'UP' : 'DOWN';

    // 방향 전환 감지
    const isUpTransition = prevDirection.current === 'DOWN' && currentDirection === 'UP';
    const isDownTransition = prevDirection.current === 'UP' && currentDirection === 'DOWN';

    const currentBottomPoint = currentScrollTop + elemHeight;

    // 방향 전환 시 transition point 업데이트
    if (isUpTransition && transitionPoint.current < currentScrollTop) {
      transitionPoint.current = prevScrollTop.current;
    }

    if (isDownTransition && currentBottomPoint < transitionPoint.current) {
      transitionPoint.current = prevScrollTop.current + elemHeight;
    }

    // marginTop 계산 (0과 -elemHeight 사이의 값)
    const calculatedMargin = Math.min(0, Math.max(-elemHeight, transitionPoint.current - currentBottomPoint));

    setMarginTop(calculatedMargin);

    // 이전 값들 업데이트
    prevDirection.current = currentDirection;
    prevScrollTop.current = currentScrollTop;
  }, [elemHeight, threshold, getScrollTop]);

  /**
   * 초기화 - 새로고침 시 현재 스크롤 위치에 맞게 설정
   */
  useEffect(() => {
    const initialScrollTop = getScrollTop();
    transitionPoint.current = initialScrollTop + elemHeight;
    prevScrollTop.current = initialScrollTop;

    // 초기 상태 설정
    if (initialScrollTop < threshold) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMarginTop(0);
    }
  }, [elemHeight, threshold, getScrollTop]);

  /**
   * 스크롤 이벤트 리스너 등록/해제
   */
  useEffect(() => {
    // passive: true로 성능 최적화
    const options: AddEventListenerOptions = { passive: true };

    window.addEventListener('scroll', handleScroll, options);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { ref: ref as React.RefObject<HTMLElement | null>, marginTop };
};
