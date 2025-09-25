import { useTabContext } from '@/features/tabs/lib/context';

interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  forceMount?: boolean;
}

export const TabPanel = ({ children, value, className, forceMount = false }: TabPanelProps) => {
  const { activeTab, tabsId } = useTabContext();
  const isActive = activeTab === value;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      aria-labelledby={`${tabsId}-trigger-${value}`}
      id={`${tabsId}-panel-${value}`}
      tabIndex={0}
      className={className}
      data-state={isActive ? 'active' : 'inactive'}
      hidden={!isActive}
    >
      {children}
    </div>
  );
};
