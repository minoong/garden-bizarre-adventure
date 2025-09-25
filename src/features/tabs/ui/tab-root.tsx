import { useCallback, useId, useState } from 'react';

import { TabProvider } from '@/features/tabs/lib/context';

interface TabRootProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const TabRoot = (props: TabRootProps) => {
  const { children, defaultValue, value, onValueChange } = props;

  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const tabsId = useId();

  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = useCallback(
    (tabId: string) => {
      if (value === undefined) {
        setInternalValue(tabId);
      }

      onValueChange?.(tabId);
    },
    [value, onValueChange],
  );

  return (
    <TabProvider
      value={{
        activeTab,
        setActiveTab,
        tabsId,
      }}
    >
      {children}
    </TabProvider>
  );
};
