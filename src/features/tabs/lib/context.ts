import { createContext, getErrorMessage } from '@/shared/lib/utils/create-context';
import type { TabContextType } from '@/features/tabs/model/type';

export const [TabProvider, useTabContext, TabContext] = createContext<TabContextType>({
  name: 'TabContext',
  hookName: 'useTabContext',
  providerName: 'TabProvider',
  errorMessage: getErrorMessage('useTabContext', 'TabProvider'),
});
