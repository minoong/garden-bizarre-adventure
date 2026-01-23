import{j as t,r as n}from"./iframe-BkO5_5id.js";import{A as i,M as R}from"./market-header-info-CZkqqPO7.js";import{B as I}from"./Box-DNpgu2wn.js";import"./preload-helper-PPVm8Dsz.js";const M={title:"Widgets/UpbitTradeLayout/MarketHeader",component:i,parameters:{layout:"centered"},decorators:[o=>t.jsx(I,{sx:{p:4,bgcolor:"#0B1219",minWidth:400},children:t.jsx(o,{})})]},e={render:()=>t.jsx(R,{base:"BTC",quote:"KRW",koreanName:"비트코인"})},r={args:{price:"95,420,000",quote:"KRW",color:"#c84a31",change:"RISE"},render:o=>{const[m,d]=n.useState(9542e4),[c,l]=n.useState("RISE");n.useEffect(()=>{const f=setInterval(()=>{const s=Math.floor(Math.random()*1e5)-5e4;d(g=>g+s),l(s>0?"RISE":"FALL")},1500);return()=>clearInterval(f)},[]);const p=new Intl.NumberFormat("ko-KR").format(m),u=c==="RISE"?"#c84a31":"#1261c4";return t.jsx(i,{...o,price:p,color:u,change:c})}},a={args:{price:"95,420,000",quote:"KRW",color:"#c84a31",change:"RISE"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => <MarketHeaderInfo base="BTC" quote="KRW" koreanName="비트코인" />
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    price: '95,420,000',
    quote: 'KRW',
    color: '#c84a31',
    change: 'RISE'
  },
  render: args => {
    // 실시간 가격 변동 시뮬레이션
    const [price, setPrice] = useState(95420000);
    const [change, setChange] = useState<'RISE' | 'FALL'>('RISE');
    useEffect(() => {
      const interval = setInterval(() => {
        const diff = Math.floor(Math.random() * 100000) - 50000;
        setPrice(prev => prev + diff);
        setChange(diff > 0 ? 'RISE' : 'FALL');
      }, 1500);
      return () => clearInterval(interval);
    }, []);
    const formattedPrice = new Intl.NumberFormat('ko-KR').format(price);
    const color = change === 'RISE' ? '#c84a31' : '#1261c4';
    return <AnimatedPrice {...args} price={formattedPrice} color={color} change={change} />;
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    price: '95,420,000',
    quote: 'KRW',
    color: '#c84a31',
    change: 'RISE'
  }
}`,...a.parameters?.docs?.source}}};const P=["HeaderInfo","PriceRolling","ManualControl"];export{e as HeaderInfo,a as ManualControl,r as PriceRolling,P as __namedExportsOrder,M as default};
