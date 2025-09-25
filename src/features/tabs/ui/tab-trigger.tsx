import { useCallback } from 'react';

import { useTabContext } from '@/features/tabs/lib/context';

interface TabTriggerProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export const TabTrigger = (props: TabTriggerProps) => {
  const { children, value, disabled = false, className } = props;

  const { activeTab, setActiveTab, tabsId } = useTabContext();

  const isActive = activeTab === value;

  const handleClick = useCallback(() => {
    if (!disabled) {
      setActiveTab(value);
    }
  }, [disabled, setActiveTab, value]);

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`${tabsId}-tabpanel-${value}`}
      id={`${tabsId}-tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={className}
      onClick={handleClick}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
    >
      {children}
    </button>
  );
};
