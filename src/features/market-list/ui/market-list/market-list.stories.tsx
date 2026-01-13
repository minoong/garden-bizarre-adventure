import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

import { MarketList, DEFAULT_COLUMNS } from './index';

const meta: Meta<typeof MarketList> = {
  title: 'Features/MarketList',
  component: MarketList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '합성 컴포넌트 패턴의 암호화폐 시세 테이블',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <MarketList showTitle={false} showStatusChip={false}>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const CustomTitle: Story = {
  render: () => (
    <MarketList title="KRW 마켓">
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const CustomColumnWidths: Story = {
  render: () => (
    <MarketList columns={['30px', '150px', '100px', '80px', '100px']}>
      <MarketList.Paper>
        <MarketList.Header>
          <MarketList.HeaderCell />
          <MarketList.HeaderCell field="korean_name" sortable>
            코인명
          </MarketList.HeaderCell>
          <MarketList.HeaderCell field="trade_price" sortable align="right">
            현재가
          </MarketList.HeaderCell>
          <MarketList.HeaderCell field="signed_change_rate" sortable align="right">
            등락률
          </MarketList.HeaderCell>
          <MarketList.HeaderCell field="acc_trade_price_24h" sortable align="right">
            거래대금
          </MarketList.HeaderCell>
        </MarketList.Header>
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const RenderPropsBody: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => (
            <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>
          )}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
  ),
};

export const RenderPropsCell: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => (
            <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell
                row={row}
                state={state}
                render={({ koreanName, base, quote }) => (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      {koreanName}
                    </Typography>
                    <Chip label={`${base}/${quote}`} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                  </Box>
                )}
              />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell
                row={row}
                state={state}
                render={({ formattedRate, color, change }) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {change === 'RISE' && <TrendingUp sx={{ fontSize: 16, color }} />}
                    {change === 'FALL' && <TrendingDown sx={{ fontSize: 16, color }} />}
                    {change === 'EVEN' && <TrendingFlat sx={{ fontSize: 16, color }} />}
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color }}>
                      {formattedRate}
                    </Typography>
                  </Box>
                )}
              />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>
          )}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
  ),
};

export const CustomFavorite: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => (
            <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell
                row={row}
                state={state}
                render={({ isFavorite, toggleFavorite }) => (
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite();
                    }}
                    sx={{
                      cursor: 'pointer',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: isFavorite ? '#fbbf24' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.2)',
                      },
                    }}
                  >
                    {isFavorite ? '★' : ''}
                  </Box>
                )}
              />
              <MarketList.NameCell row={row} state={state} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>
          )}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
  ),
};

export const CustomHeaderRenderProps: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header>
          <MarketList.HeaderCell />
          <MarketList.HeaderCell
            field="korean_name"
            sortable
            render={({ sortBy, sortOrder }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  코인
                </Typography>
                {sortBy === 'korean_name' && (
                  <Typography variant="caption" sx={{ color: 'primary.main' }}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Typography>
                )}
              </Box>
            )}
          />
          <MarketList.HeaderCell field="trade_price" sortable align="right">
            현재가
          </MarketList.HeaderCell>
          <MarketList.HeaderCell field="signed_change_rate" sortable align="right">
            전일대비
          </MarketList.HeaderCell>
          <MarketList.HeaderCell field="acc_trade_price_24h" sortable align="right">
            거래대금
          </MarketList.HeaderCell>
        </MarketList.Header>
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const WithRowClick: Story = {
  render: () => (
    <MarketList onRowClick={(market) => alert(`선택: ${market}`)}>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const WithoutCandle: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => (
            <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} showCandle={false} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>
          )}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
  ),
};

export const CustomHeight: Story = {
  render: () => (
    <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body maxHeight={300} />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const CustomInitialSort: Story = {
  render: () => (
    <MarketList initialSortBy="signed_change_rate" initialSortOrder="desc">
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
  ),
};

export const WithCustomCell: Story = {
  render: () => (
    <MarketList columns={['26px', '120px', '88px', '80px']}>
      <MarketList.Paper>
        <MarketList.Header>
          <MarketList.HeaderCell />
          <MarketList.HeaderCell field="korean_name" sortable>
            한글명
          </MarketList.HeaderCell>
          <MarketList.HeaderCell field="trade_price" sortable align="right">
            현재가
          </MarketList.HeaderCell>
          <MarketList.HeaderCell align="center">액션</MarketList.HeaderCell>
        </MarketList.Header>
        <MarketList.Body>
          {(row, state) => (
            <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} showCandle={false} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.Cell align="center">
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    label="매수"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`매수: ${row.korean_name}`);
                    }}
                    sx={{ height: 20, fontSize: '0.6rem', cursor: 'pointer', bgcolor: '#c84a31', color: 'white' }}
                  />
                </Box>
              </MarketList.Cell>
            </MarketList.Row>
          )}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
  ),
};

export const ShowDefaultColumns: Story = {
  render: () => (
    <Box>
      <Typography variant="body2" sx={{ mb: 2, fontFamily: 'monospace' }}>
        DEFAULT_COLUMNS: {JSON.stringify(DEFAULT_COLUMNS)}
      </Typography>
      <MarketList>
        <MarketList.Paper>
          <MarketList.Header />
          <MarketList.Body />
        </MarketList.Paper>
      </MarketList>
    </Box>
  ),
};
