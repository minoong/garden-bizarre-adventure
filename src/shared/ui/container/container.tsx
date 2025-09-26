'use client';

import type { ContainerProps as MuiContainerProps } from '@mui/material';
import { Container as MuiContainer } from '@mui/material';
import type { ReactNode } from 'react';

interface ContainerProps extends Omit<MuiContainerProps, 'children'> {
  children: ReactNode;
}

export const Container = ({ children, maxWidth = 'lg', ...props }: ContainerProps) => {
  return (
    <MuiContainer maxWidth={maxWidth} {...props}>
      {children}
    </MuiContainer>
  );
};
