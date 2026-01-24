import{j as e}from"./iframe-D0FL2x0d.js";import{c as f}from"./useSlot-CviH88Ke.js";import{M as r,D as w}from"./index-DQ6rys7Y.js";import{B as l,T as n}from"./Box-BVFxYzGc.js";import{C as H}from"./price-change-B5bi0tLp.js";import"./preload-helper-PPVm8Dsz.js";import"./favorite-store-gZ-XHSQa.js";import"./format-BhZbsWtE.js";import"./index-fHBMVlmr.js";import"./index-CQcG8Rfo.js";import"./CircularProgress-Br4Dg85h.js";import"./IconButton-C-Eg1Fe1.js";import"./isFocusVisible-B8k4qzLc.js";import"./d3-candle-Dzev0e9x.js";import"./Close-DQ4vEmv-.js";import"./InputBase-7PUW0TEN.js";import"./debounce-Be36O1Ab.js";import"./Divider-BOKNLLhp.js";import"./Paper-CpC3ehSq.js";import"./useTheme-Dt5PmmGK.js";const P=f(e.jsx("path",{d:"m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"})),B=f(e.jsx("path",{d:"m16 18 2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"})),S=f(e.jsx("path",{d:"m22 12-4-4v3H3v2h15v3z"})),G={title:"트레이딩/Market List",component:r,parameters:{layout:"padded",docs:{description:{component:"합성 컴포넌트 패턴의 암호화폐 시세 테이블"}}},tags:["autodocs"]},d={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{})]})})},c={render:()=>e.jsx(r,{showTitle:!1,showStatusChip:!1,children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{})]})})},p={render:()=>e.jsx(r,{title:"KRW 마켓",children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{})]})})},x={render:()=>e.jsx(r,{columns:["30px","150px","100px","80px","100px"],children:e.jsxs(r.Paper,{children:[e.jsxs(r.Header,{children:[e.jsx(r.HeaderCell,{}),e.jsx(r.HeaderCell,{field:"korean_name",sortable:!0,children:"코인명"}),e.jsx(r.HeaderCell,{field:"trade_price",sortable:!0,align:"right",children:"현재가"}),e.jsx(r.HeaderCell,{field:"signed_change_rate",sortable:!0,align:"right",children:"등락률"}),e.jsx(r.HeaderCell,{field:"acc_trade_price_24h",sortable:!0,align:"right",children:"거래대금"})]}),e.jsx(r.Body,{})]})})},m={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{children:(t,a)=>e.jsxs(r.Row,{row:t,state:a,children:[e.jsx(r.FavoriteCell,{row:t,state:a}),e.jsx(r.NameCell,{row:t,state:a}),e.jsx(r.PriceCell,{row:t,state:a}),e.jsx(r.ChangeCell,{row:t,state:a}),e.jsx(r.VolumeCell,{row:t,state:a})]})})]})})},k={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{children:(t,a)=>e.jsxs(r.Row,{row:t,state:a,children:[e.jsx(r.FavoriteCell,{row:t,state:a}),e.jsx(r.NameCell,{row:t,state:a,render:({koreanName:s,base:i,quote:o})=>e.jsxs(l,{children:[e.jsx(n,{variant:"body2",sx:{fontWeight:600,fontSize:"0.8rem"},children:s}),e.jsx(H,{label:`${i}/${o}`,size:"small",sx:{height:16,fontSize:"0.6rem"}})]})}),e.jsx(r.PriceCell,{row:t,state:a}),e.jsx(r.ChangeCell,{row:t,state:a,render:({formattedRate:s,color:i,change:o})=>e.jsxs(l,{sx:{display:"flex",alignItems:"center",gap:.5},children:[o==="RISE"&&e.jsx(P,{sx:{fontSize:16,color:i}}),o==="FALL"&&e.jsx(B,{sx:{fontSize:16,color:i}}),o==="EVEN"&&e.jsx(S,{sx:{fontSize:16,color:i}}),e.jsx(n,{variant:"body2",sx:{fontSize:"0.75rem",color:i},children:s})]})}),e.jsx(r.VolumeCell,{row:t,state:a})]})})]})})},L={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{children:(t,a)=>e.jsxs(r.Row,{row:t,state:a,children:[e.jsx(r.FavoriteCell,{row:t,state:a,render:({isFavorite:s,toggleFavorite:i})=>e.jsx(l,{onClick:o=>{o.stopPropagation(),i()},sx:{cursor:"pointer",width:16,height:16,borderRadius:"50%",bgcolor:s?"#fbbf24":"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",transition:"all 0.2s","&:hover":{transform:"scale(1.2)"}},children:s?"★":""})}),e.jsx(r.NameCell,{row:t,state:a}),e.jsx(r.PriceCell,{row:t,state:a}),e.jsx(r.ChangeCell,{row:t,state:a}),e.jsx(r.VolumeCell,{row:t,state:a})]})})]})})},h={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsxs(r.Header,{children:[e.jsx(r.HeaderCell,{}),e.jsx(r.HeaderCell,{field:"korean_name",sortable:!0,render:({sortBy:t,sortOrder:a})=>e.jsxs(l,{sx:{display:"flex",alignItems:"center",gap:.5},children:[e.jsx(n,{variant:"caption",sx:{fontWeight:600},children:"코인"}),t==="korean_name"&&e.jsx(n,{variant:"caption",sx:{color:"primary.main"},children:a==="asc"?"↑":"↓"})]})}),e.jsx(r.HeaderCell,{field:"trade_price",sortable:!0,align:"right",children:"현재가"}),e.jsx(r.HeaderCell,{field:"signed_change_rate",sortable:!0,align:"right",children:"전일대비"}),e.jsx(r.HeaderCell,{field:"acc_trade_price_24h",sortable:!0,align:"right",children:"거래대금"})]}),e.jsx(r.Body,{})]})})},M={render:()=>e.jsx(r,{onRowClick:t=>alert(`선택: ${t}`),children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{})]})})},C={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{children:(t,a)=>e.jsxs(r.Row,{row:t,state:a,children:[e.jsx(r.FavoriteCell,{row:t,state:a}),e.jsx(r.NameCell,{row:t,state:a,showCandle:!1}),e.jsx(r.PriceCell,{row:t,state:a}),e.jsx(r.ChangeCell,{row:t,state:a}),e.jsx(r.VolumeCell,{row:t,state:a})]})})]})})},g={render:()=>e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{maxHeight:300})]})})},j={render:()=>e.jsx(r,{initialSortBy:"signed_change_rate",initialSortOrder:"desc",children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{})]})})},u={render:()=>e.jsx(r,{columns:["26px","120px","88px","80px"],children:e.jsxs(r.Paper,{children:[e.jsxs(r.Header,{children:[e.jsx(r.HeaderCell,{}),e.jsx(r.HeaderCell,{field:"korean_name",sortable:!0,children:"한글명"}),e.jsx(r.HeaderCell,{field:"trade_price",sortable:!0,align:"right",children:"현재가"}),e.jsx(r.HeaderCell,{align:"center",children:"액션"})]}),e.jsx(r.Body,{children:(t,a)=>e.jsxs(r.Row,{row:t,state:a,children:[e.jsx(r.FavoriteCell,{row:t,state:a}),e.jsx(r.NameCell,{row:t,state:a,showCandle:!1}),e.jsx(r.PriceCell,{row:t,state:a}),e.jsx(r.Cell,{align:"center",children:e.jsx(l,{sx:{display:"flex",gap:.5},children:e.jsx(H,{label:"매수",size:"small",onClick:s=>{s.stopPropagation(),alert(`매수: ${t.korean_name}`)},sx:{height:20,fontSize:"0.6rem",cursor:"pointer",bgcolor:"#c84a31",color:"white"}})})})]})})]})})},y={render:()=>e.jsxs(l,{children:[e.jsxs(n,{variant:"body2",sx:{mb:2,fontFamily:"monospace"},children:["DEFAULT_COLUMNS: ",JSON.stringify(w)]}),e.jsx(r,{children:e.jsxs(r.Paper,{children:[e.jsx(r.Header,{}),e.jsx(r.Body,{})]})})]})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList showTitle={false} showStatusChip={false}>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList title="KRW 마켓">
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
}`,...p.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList columns={['30px', '150px', '100px', '80px', '100px']}>
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
}`,...x.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
}`,...m.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} render={({
            koreanName,
            base,
            quote
          }) => <Box>
                    <Typography variant="body2" sx={{
              fontWeight: 600,
              fontSize: '0.8rem'
            }}>
                      {koreanName}
                    </Typography>
                    <Chip label={\`\${base}/\${quote}\`} size="small" sx={{
              height: 16,
              fontSize: '0.6rem'
            }} />
                  </Box>} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} render={({
            formattedRate,
            color,
            change
          }) => <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
                    {change === 'RISE' && <TrendingUp sx={{
              fontSize: 16,
              color
            }} />}
                    {change === 'FALL' && <TrendingDown sx={{
              fontSize: 16,
              color
            }} />}
                    {change === 'EVEN' && <TrendingFlat sx={{
              fontSize: 16,
              color
            }} />}
                    <Typography variant="body2" sx={{
              fontSize: '0.75rem',
              color
            }}>
                      {formattedRate}
                    </Typography>
                  </Box>} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
}`,...k.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} render={({
            isFavorite,
            toggleFavorite
          }) => <Box onClick={e => {
            e.stopPropagation();
            toggleFavorite();
          }} sx={{
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
              transform: 'scale(1.2)'
            }
          }}>
                    {isFavorite ? '★' : ''}
                  </Box>} />
              <MarketList.NameCell row={row} state={state} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
}`,...L.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header>
          <MarketList.HeaderCell />
          <MarketList.HeaderCell field="korean_name" sortable render={({
          sortBy,
          sortOrder
        }) => <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
                <Typography variant="caption" sx={{
            fontWeight: 600
          }}>
                  코인
                </Typography>
                {sortBy === 'korean_name' && <Typography variant="caption" sx={{
            color: 'primary.main'
          }}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Typography>}
              </Box>} />
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
}`,...h.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList onRowClick={market => alert(\`선택: \${market}\`)}>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
}`,...M.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body>
          {(row, state) => <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} showCandle={false} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.ChangeCell row={row} state={state} />
              <MarketList.VolumeCell row={row} state={state} />
            </MarketList.Row>}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
}`,...C.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList>
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body maxHeight={300} />
      </MarketList.Paper>
    </MarketList>
}`,...g.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList initialSortBy="signed_change_rate" initialSortOrder="desc">
      <MarketList.Paper>
        <MarketList.Header />
        <MarketList.Body />
      </MarketList.Paper>
    </MarketList>
}`,...j.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <MarketList columns={['26px', '120px', '88px', '80px']}>
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
          {(row, state) => <MarketList.Row row={row} state={state}>
              <MarketList.FavoriteCell row={row} state={state} />
              <MarketList.NameCell row={row} state={state} showCandle={false} />
              <MarketList.PriceCell row={row} state={state} />
              <MarketList.Cell align="center">
                <Box sx={{
              display: 'flex',
              gap: 0.5
            }}>
                  <Chip label="매수" size="small" onClick={e => {
                e.stopPropagation();
                alert(\`매수: \${row.korean_name}\`);
              }} sx={{
                height: 20,
                fontSize: '0.6rem',
                cursor: 'pointer',
                bgcolor: '#c84a31',
                color: 'white'
              }} />
                </Box>
              </MarketList.Cell>
            </MarketList.Row>}
        </MarketList.Body>
      </MarketList.Paper>
    </MarketList>
}`,...u.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Box>
      <Typography variant="body2" sx={{
      mb: 2,
      fontFamily: 'monospace'
    }}>
        DEFAULT_COLUMNS: {JSON.stringify(DEFAULT_COLUMNS)}
      </Typography>
      <MarketList>
        <MarketList.Paper>
          <MarketList.Header />
          <MarketList.Body />
        </MarketList.Paper>
      </MarketList>
    </Box>
}`,...y.parameters?.docs?.source}}};const Q=["Default","WithoutTitle","CustomTitle","CustomColumnWidths","RenderPropsBody","RenderPropsCell","CustomFavorite","CustomHeaderRenderProps","WithRowClick","WithoutCandle","CustomHeight","CustomInitialSort","WithCustomCell","ShowDefaultColumns"];export{x as CustomColumnWidths,L as CustomFavorite,h as CustomHeaderRenderProps,g as CustomHeight,j as CustomInitialSort,p as CustomTitle,d as Default,m as RenderPropsBody,k as RenderPropsCell,y as ShowDefaultColumns,u as WithCustomCell,M as WithRowClick,C as WithoutCandle,c as WithoutTitle,Q as __namedExportsOrder,G as default};
