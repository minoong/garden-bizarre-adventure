'use client';

import { useEffect, useState } from 'react';
import * as motion from 'motion/react-client';

import { shuffle } from '@/shared/ui/loading/lib';

type LoadingSize = 'xsmall' | 'small' | 'medium' | 'large';

interface ShuffleLoadingProps {
  size?: LoadingSize;
}

const INITIAL_COLORS = ['#ff0088', '#dd00ee', '#9911ff', '#0d63f8'];
const SHUFFLE_INTERVAL = 1000;
const ANIMATION_GAP: Record<LoadingSize, number> = {
  xsmall: 2,
  small: 5,
  medium: 10,
  large: 15,
};

const ITEM_STYLES: Record<LoadingSize, React.CSSProperties> = {
  xsmall: {
    width: 25,
    height: 25,
    borderRadius: '7px',
  },
  small: {
    width: 50,
    height: 50,
    borderRadius: '10px',
  },
  medium: {
    width: 100,
    height: 100,
    borderRadius: '10px',
  },
  large: {
    width: 150,
    height: 150,
    borderRadius: '10px',
  },
} as const;

const CONTAINER_WIDTHS: Record<LoadingSize, number> = {
  xsmall: 70,
  small: 150,
  medium: 300,
  large: 400,
} as const;

const SPRING_TRANSITION = {
  type: 'spring' as const,
  damping: 20,
  stiffness: 300,
};

export function ShuffleLoading({ size = 'medium' }: ShuffleLoadingProps) {
  const [order, setOrder] = useState(INITIAL_COLORS);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOrder(shuffle(order));
    }, SHUFFLE_INTERVAL);

    return () => clearTimeout(timeout);
  }, [order]);

  return (
    <motion.ul
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        gap: ANIMATION_GAP[size],
        width: CONTAINER_WIDTHS[size],
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {order.map((backgroundColor) => (
        <motion.li
          key={backgroundColor}
          layout
          transition={SPRING_TRANSITION}
          style={{
            ...ITEM_STYLES[size],
            backgroundColor,
          }}
        />
      ))}
    </motion.ul>
  );
}
