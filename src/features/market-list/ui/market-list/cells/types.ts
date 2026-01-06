import type { SxProps, Theme } from '@mui/material';

import type { MarketRowData } from '../../../model/types';
import type { RowRenderState } from '../market-list-context';

/**
 * 공통 Cell Props
 */
export interface BaseCellProps {
  row: MarketRowData;
  state: RowRenderState;
  sx?: SxProps<Theme>;
}
