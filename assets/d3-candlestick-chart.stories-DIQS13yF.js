import{j as e,Q as l,a as g}from"./iframe-D4KFpum-.js";import{D as C}from"./d3-candlestick-chart-l6WlliLL.js";import{B as u}from"./Box-NGoC4RE2.js";import"./preload-helper-PPVm8Dsz.js";import"./favorite-store-s90Kk-UZ.js";import"./use-candles-Cv2qLIGo.js";import"./d3-candle-CBh160fp.js";import"./CircularProgress-y47b3T67.js";const p=new g({defaultOptions:{queries:{staleTime:10*1e3,retry:1}}}),R={title:"트레이딩/Charts/D3 Chart",component:C,parameters:{layout:"padded"},tags:["autodocs"],decorators:[r=>e.jsx(l,{client:p,children:e.jsx(r,{})})]},t={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:15},height:400,width:800,initialCount:100,showGrid:!0,showPriceAxis:!0,showTimeAxis:!0}},n={args:{market:"KRW-BTC",timeframe:{type:"days"},height:500,width:1e3,initialCount:100}},a={args:{market:"KRW-ETH",timeframe:{type:"minutes",unit:60},height:400,width:800,upColor:"#00ff00",downColor:"#ff0000",backgroundColor:"#000000"},decorators:[r=>e.jsx(l,{client:p,children:e.jsx(u,{sx:{bgcolor:"#000",p:2},children:e.jsx(r,{})})})]},s={args:{market:"KRW-BTC",timeframe:{type:"days"},height:400,width:800,candleWidth:20,candleSpacing:5,initialCount:50}},i={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:5},height:400,width:800,candleWidth:4,candleSpacing:1,initialCount:200}},o={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:15},height:500,width:1e3,backgroundColor:"#1a1a1a",upColor:"#26a69a",downColor:"#ef5350"},decorators:[r=>e.jsx(l,{client:p,children:e.jsx(u,{sx:{bgcolor:"#0a0a0a",p:3},children:e.jsx(r,{})})})]},c={args:{market:"KRW-BTC",timeframe:{type:"days"},height:400,width:200,initialCount:1,candleWidth:60,candleSpacing:0,showGrid:!1,showPriceAxis:!1,showTimeAxis:!1}},d={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:15},height:400,width:800,showGrid:!1,showPriceAxis:!1,showTimeAxis:!1}};function y(){const r=["KRW-BTC","KRW-ETH","KRW-XRP"];return e.jsx(u,{sx:{display:"flex",flexDirection:"column",gap:2,bgcolor:"#f5f5f5",p:2},children:r.map(h=>e.jsx(C,{market:h,timeframe:{type:"minutes",unit:15},height:250,width:600,initialCount:50},h))})}const m={render:()=>e.jsx(y,{}),parameters:{layout:"fullscreen"},decorators:[r=>e.jsx(l,{client:p,children:e.jsx(r,{})})]};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'minutes',
      unit: 15
    },
    height: 400,
    width: 800,
    initialCount: 100,
    showGrid: true,
    showPriceAxis: true,
    showTimeAxis: true
  }
}`,...t.parameters?.docs?.source},description:{story:"기본 D3 캔들스틱 차트 (그리드, 가격축, 시간축 포함)",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'days'
    },
    height: 500,
    width: 1000,
    initialCount: 100
  }
}`,...n.parameters?.docs?.source},description:{story:"일봉 차트",...n.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-ETH',
    timeframe: {
      type: 'minutes',
      unit: 60
    },
    height: 400,
    width: 800,
    upColor: '#00ff00',
    downColor: '#ff0000',
    backgroundColor: '#000000'
  },
  decorators: [Story => <QueryClientProvider client={queryClient}>
        <Box sx={{
      bgcolor: '#000',
      p: 2
    }}>
          <Story />
        </Box>
      </QueryClientProvider>]
}`,...a.parameters?.docs?.source},description:{story:"커스텀 색상",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'days'
    },
    height: 400,
    width: 800,
    candleWidth: 20,
    candleSpacing: 5,
    initialCount: 50
  }
}`,...s.parameters?.docs?.source},description:{story:"넓은 캔들",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'minutes',
      unit: 5
    },
    height: 400,
    width: 800,
    candleWidth: 4,
    candleSpacing: 1,
    initialCount: 200
  }
}`,...i.parameters?.docs?.source},description:{story:"좁은 캔들",...i.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'minutes',
      unit: 15
    },
    height: 500,
    width: 1000,
    backgroundColor: '#1a1a1a',
    upColor: '#26a69a',
    downColor: '#ef5350'
  },
  decorators: [Story => <QueryClientProvider client={queryClient}>
        <Box sx={{
      bgcolor: '#0a0a0a',
      p: 3
    }}>
          <Story />
        </Box>
      </QueryClientProvider>]
}`,...o.parameters?.docs?.source},description:{story:"다크 모드",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'days'
    },
    height: 400,
    width: 200,
    initialCount: 1,
    candleWidth: 60,
    candleSpacing: 0,
    showGrid: false,
    showPriceAxis: false,
    showTimeAxis: false
  }
}`,...c.parameters?.docs?.source},description:{story:"단일 캔들",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'minutes',
      unit: 15
    },
    height: 400,
    width: 800,
    showGrid: false,
    showPriceAxis: false,
    showTimeAxis: false
  }
}`,...d.parameters?.docs?.source},description:{story:"축과 그리드 없이",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <MultiChartExample />,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [Story => <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>]
}`,...m.parameters?.docs?.source}}};const K=["Default","DailyChart","CustomColors","WideCandles","NarrowCandles","DarkMode","SingleCandle","WithoutAxes","MultiChart"];export{a as CustomColors,n as DailyChart,o as DarkMode,t as Default,m as MultiChart,i as NarrowCandles,c as SingleCandle,s as WideCandles,d as WithoutAxes,K as __namedExportsOrder,R as default};
