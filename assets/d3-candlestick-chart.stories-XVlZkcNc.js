import{r as Y,j as e,Q as W,f as Z}from"./iframe-BVZwR0Wz.js";import"./store-D8IA23IL.js";import{u as ee}from"./use-candles-B19EYTZR.js";import{l as te,D as re}from"./d3-candle-x60tDnMF.js";import{B as l,T as Q}from"./Box-DuUtChGJ.js";import{C as ae}from"./CircularProgress-BGRnZc4a.js";import"./preload-helper-PPVm8Dsz.js";const r={top:20,right:60,bottom:40,left:10},R=({market:n,timeframe:d,height:s=400,width:b=800,initialCount:E=100,candleSpacing:q=2,candleWidth:v=8,upColor:G="#C84931",downColor:H="#1361C5",backgroundColor:w="#ffffff",showGrid:I=!0,showPriceAxis:F=!0,showTimeAxis:L=!0,textColor:B="#666",gridColor:$="#e0e0e0",className:T})=>{const{data:o,isLoading:z,error:N}=ee(n,d,{count:E}),a=Y.useMemo(()=>{if(!o||o.length===0)return null;const t=o.flatMap(c=>[c.high_price,c.low_price]),i=Math.min(...t),k=Math.max(...t),K=(k-i)*.05,A=i-K,_=k+K,D=s-r.top-r.bottom,P=v+q,O=Math.max(o.length*P,b-r.left-r.right),M=te().domain([A,_]).range([D,0]),X=M.ticks(5),U=o.map((c,m)=>({candle:c,x:r.left+(m+.5)*P})),V=Math.max(1,Math.floor(o.length/10)),J=o.filter((c,m)=>m%V===0).map((c,m)=>({x:r.left+m*V*P,label:new Date(c.candle_date_time_kst).toLocaleString("ko-KR",{month:"2-digit",day:"2-digit",hour:d.type==="minutes"?"2-digit":void 0,minute:d.type==="minutes"?"2-digit":void 0})}));return{candles:U,minPrice:A,maxPrice:_,chartWidth:O+r.left+r.right,chartHeight:D,yScale:M,priceTicks:X,timeTicks:J}},[o,b,s,v,q,d.type]);return z?e.jsx(l,{className:T,sx:{display:"flex",alignItems:"center",justifyContent:"center",height:s,backgroundColor:w},children:e.jsx(ae,{})}):N?e.jsx(l,{className:T,sx:{display:"flex",alignItems:"center",justifyContent:"center",height:s,backgroundColor:w},children:e.jsx(Q,{color:"error",children:"차트 로드 실패"})}):a?e.jsx(l,{className:T,sx:{width:"100%",height:s,backgroundColor:w,overflow:"auto"},children:e.jsxs("svg",{width:a.chartWidth,height:s,children:[I&&e.jsx("g",{children:a.priceTicks.map(t=>{const i=r.top+a.yScale(t);return e.jsx("line",{x1:r.left,y1:i,x2:a.chartWidth-r.right,y2:i,stroke:$,strokeWidth:1,opacity:.5},t)})}),e.jsx("g",{children:a.candles.map(({candle:t,x:i},k)=>e.jsx("g",{transform:`translate(0, ${r.top})`,children:e.jsx(re,{open:t.opening_price,close:t.trade_price,high:t.high_price,low:t.low_price,x:i,width:v,height:a.chartHeight,minPrice:a.minPrice,maxPrice:a.maxPrice,upColor:G,downColor:H})},`${t.candle_date_time_kst}-${k}`))}),F&&e.jsx("g",{children:a.priceTicks.map(t=>{const i=r.top+a.yScale(t);return e.jsx("text",{x:a.chartWidth-r.right+5,y:i,dy:"0.35em",fill:B,fontSize:11,fontFamily:"monospace",children:t.toLocaleString("ko-KR")},t)})}),L&&e.jsx("g",{children:a.timeTicks.map((t,i)=>e.jsx("text",{x:t.x,y:s-r.bottom+15,fill:B,fontSize:10,fontFamily:"monospace",textAnchor:"middle",children:t.label},i))})]})}):e.jsx(l,{className:T,sx:{display:"flex",alignItems:"center",justifyContent:"center",height:s,backgroundColor:w},children:e.jsx(Q,{children:"데이터 없음"})})};R.__docgenInfo={description:"D3 기반 캔들스틱 차트",methods:[],displayName:"D3CandlestickChart",props:{market:{required:!0,tsType:{name:"string"},description:"마켓 코드"},timeframe:{required:!0,tsType:{name:"CandleTimeframe"},description:"타임프레임"},height:{required:!1,tsType:{name:"number"},description:"차트 높이",defaultValue:{value:"400",computed:!1}},width:{required:!1,tsType:{name:"number"},description:"차트 너비",defaultValue:{value:"800",computed:!1}},initialCount:{required:!1,tsType:{name:"number"},description:"초기 캔들 개수",defaultValue:{value:"100",computed:!1}},candleSpacing:{required:!1,tsType:{name:"number"},description:"캔들 간격 (픽셀)",defaultValue:{value:"2",computed:!1}},candleWidth:{required:!1,tsType:{name:"number"},description:"캔들 너비 (픽셀)",defaultValue:{value:"8",computed:!1}},upColor:{required:!1,tsType:{name:"string"},description:"상승 색상",defaultValue:{value:"'#C84931'",computed:!1}},downColor:{required:!1,tsType:{name:"string"},description:"하락 색상",defaultValue:{value:"'#1361C5'",computed:!1}},backgroundColor:{required:!1,tsType:{name:"string"},description:"배경 색상",defaultValue:{value:"'#ffffff'",computed:!1}},showGrid:{required:!1,tsType:{name:"boolean"},description:"그리드 표시",defaultValue:{value:"true",computed:!1}},showPriceAxis:{required:!1,tsType:{name:"boolean"},description:"가격 축 표시",defaultValue:{value:"true",computed:!1}},showTimeAxis:{required:!1,tsType:{name:"boolean"},description:"시간 축 표시",defaultValue:{value:"true",computed:!1}},textColor:{required:!1,tsType:{name:"string"},description:"텍스트 색상",defaultValue:{value:"'#666'",computed:!1}},gridColor:{required:!1,tsType:{name:"string"},description:"그리드 색상",defaultValue:{value:"'#e0e0e0'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"클래스명"}}};const S=new Z({defaultOptions:{queries:{staleTime:10*1e3,retry:1}}}),ue={title:"Features/UpbitChart/D3CandlestickChart",component:R,parameters:{layout:"padded"},tags:["autodocs"],decorators:[n=>e.jsx(W,{client:S,children:e.jsx(n,{})})]},u={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:15},height:400,width:800,initialCount:100,showGrid:!0,showPriceAxis:!0,showTimeAxis:!0}},p={args:{market:"KRW-BTC",timeframe:{type:"days"},height:500,width:1e3,initialCount:100}},h={args:{market:"KRW-ETH",timeframe:{type:"minutes",unit:60},height:400,width:800,upColor:"#00ff00",downColor:"#ff0000",backgroundColor:"#000000"},decorators:[n=>e.jsx(W,{client:S,children:e.jsx(l,{sx:{bgcolor:"#000",p:2},children:e.jsx(n,{})})})]},f={args:{market:"KRW-BTC",timeframe:{type:"days"},height:400,width:800,candleWidth:20,candleSpacing:5,initialCount:50}},g={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:5},height:400,width:800,candleWidth:4,candleSpacing:1,initialCount:200}},y={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:15},height:500,width:1e3,backgroundColor:"#1a1a1a",upColor:"#26a69a",downColor:"#ef5350"},decorators:[n=>e.jsx(W,{client:S,children:e.jsx(l,{sx:{bgcolor:"#0a0a0a",p:3},children:e.jsx(n,{})})})]},x={args:{market:"KRW-BTC",timeframe:{type:"days"},height:400,width:200,initialCount:1,candleWidth:60,candleSpacing:0,showGrid:!1,showPriceAxis:!1,showTimeAxis:!1}},C={args:{market:"KRW-BTC",timeframe:{type:"minutes",unit:15},height:400,width:800,showGrid:!1,showPriceAxis:!1,showTimeAxis:!1}};function ne(){const n=["KRW-BTC","KRW-ETH","KRW-XRP"];return e.jsx(l,{sx:{display:"flex",flexDirection:"column",gap:2,bgcolor:"#f5f5f5",p:2},children:n.map(d=>e.jsx(R,{market:d,timeframe:{type:"minutes",unit:15},height:250,width:600,initialCount:50},d))})}const j={render:()=>e.jsx(ne,{}),parameters:{layout:"fullscreen"},decorators:[n=>e.jsx(W,{client:S,children:e.jsx(n,{})})]};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:"기본 D3 캔들스틱 차트 (그리드, 가격축, 시간축 포함)",...u.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    market: 'KRW-BTC',
    timeframe: {
      type: 'days'
    },
    height: 500,
    width: 1000,
    initialCount: 100
  }
}`,...p.parameters?.docs?.source},description:{story:"일봉 차트",...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:"커스텀 색상",...h.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:"넓은 캔들",...f.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:"좁은 캔들",...g.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"다크 모드",...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:"단일 캔들",...x.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:"축과 그리드 없이",...C.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <MultiChartExample />,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [Story => <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>]
}`,...j.parameters?.docs?.source}}};const pe=["Default","DailyChart","CustomColors","WideCandles","NarrowCandles","DarkMode","SingleCandle","WithoutAxes","MultiChart"];export{h as CustomColors,p as DailyChart,y as DarkMode,u as Default,j as MultiChart,g as NarrowCandles,x as SingleCandle,f as WideCandles,C as WithoutAxes,pe as __namedExportsOrder,ue as default};
