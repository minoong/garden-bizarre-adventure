export interface TabContextType {
  activeTab: string;
  setActiveTab: (tabId: string) => void;

  tabsId: string;
}
