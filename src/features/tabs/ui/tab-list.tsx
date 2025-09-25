import { useCallback } from 'react';

import { useTabContext } from '@/features/tabs/lib/context';

interface TabListProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const TabList = (props: TabListProps) => {
  const { children, className, 'aria-label': ariaLabel } = props;

  const { tabsId } = useTabContext();

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const tabElements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(`[role="tab"]`));

    const currentIndex = tabElements.findIndex((tab) => tab === document.activeElement);

    let nextIndex = currentIndex;

    if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabElements.length - 1;
    } else if (event.key === 'ArrowRight') {
      nextIndex = currentIndex < tabElements.length - 1 ? currentIndex + 1 : 0;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      tabElements[nextIndex].focus();
      tabElements[nextIndex].click();
    }
  }, []);

  return (
    <div role="tablist" aria-label={ariaLabel} aria-orientation="horizontal" className={className} onKeyDown={handleKeyDown} id={`${tabsId}-tablist`}>
      {children}
    </div>
  );
};
