import{r as a,j as e}from"./iframe-D9vfYdrk.js";import{_ as z}from"./preload-helper-PPVm8Dsz.js";function v({maxWidth:l=400,fontSize:m=24,underlineHeight:p=4,underlineColor:j="#000000",textColor:w="#000000"}){const[r,S]=a.useState(""),[d,W]=a.useState([]),N=a.useRef(null),c=a.useRef(null),y=a.useCallback(t=>{if(!t)return[];const n=[];let o="",s=0;for(const i of t){const u=/[가-힣]/.test(i)?m*1.2:m*.6;s+u>l&&o.length>0?(n.push(o),o=i,s=u):(o+=i,s+=u)}return o&&n.push(o),n},[l,m]);a.useEffect(()=>{W(y(r))},[r,y]);const T=a.useCallback(t=>!r||t>=r.length?0:(t+r.charCodeAt(t))%161-80,[r]),_=a.useCallback(t=>!r||t>=r.length?1:.8+(t+r.charCodeAt(t))%41/100,[r]),k=a.useCallback(async()=>{if(c.current)try{const t=(await z(async()=>{const{default:s}=await import("./html2canvas.esm-B0tyYwQk.js");return{default:s}},[],import.meta.url)).default,n=await t(c.current,{backgroundColor:null,scale:2,logging:!1,useCORS:!0,allowTaint:!0,windowWidth:c.current.scrollWidth,windowHeight:c.current.scrollHeight}),o=document.createElement("a");o.download=`animated-text-${Date.now()}.png`,o.href=n.toDataURL("image/png"),o.click()}catch(t){console.error("이미지 내보내기 실패:",t),alert("이미지 내보내기에 실패했습니다. html2canvas 패키지가 필요합니다.")}},[]);return e.jsxs("div",{className:"flex flex-col gap-4 p-6",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{htmlFor:"text-input",className:"text-sm font-medium text-gray-700",children:"텍스트 입력"}),e.jsx("input",{id:"text-input",type:"text",value:r,onChange:t=>S(t.target.value),placeholder:"텍스트를 입력하세요...",className:"rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"미리보기"}),e.jsx("button",{onClick:k,disabled:!r,className:"rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300",children:"이미지로 내보내기"})]}),e.jsx("div",{ref:N,className:"relative min-h-[200px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-6",children:e.jsxs("div",{ref:c,className:"relative",style:{minHeight:"150px",backgroundColor:"transparent"},children:[d.length>0&&e.jsxs("div",{className:"relative mx-auto pb-2",style:{paddingBottom:`${p+24}px`,width:"160px"},children:[d.map((t,n)=>e.jsx("div",{className:"flex flex-wrap justify-center",style:{marginBottom:n<d.length-1?"0.5rem":"0",gap:"4px"},children:t.split("").map((o,s)=>{const i=d.slice(0,n).join("").length+s,u=T(i),H=_(i);return e.jsx("span",{className:"inline-block origin-center transition-transform duration-300",style:{transform:`rotate(${u}deg) scale(${H})`,fontSize:`${m}px`,color:w,fontWeight:"bold"},children:o},`${n}-${s}`)})},n)),e.jsx("div",{className:"absolute left-1/2 -translate-x-1/2",style:{bottom:"0",width:"160px",height:`${p*8}px`},children:e.jsx("svg",{width:"160",height:p*8,viewBox:"0 0 160 40",preserveAspectRatio:"none",style:{display:"block"},children:e.jsx("path",{d:"M 0,5 Q 80,38 160,5",stroke:j,strokeWidth:p*2,fill:"none",strokeLinecap:"round",vectorEffect:"non-scaling-stroke"})})})]}),d.length===0&&e.jsx("div",{className:"flex h-full items-center justify-center text-gray-400",children:"텍스트를 입력하면 미리보기가 표시됩니다"})]})})]})]})}v.__docgenInfo={description:"",methods:[],displayName:"AnimatedText",props:{maxWidth:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"400",computed:!1}},fontSize:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"24",computed:!1}},underlineHeight:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4",computed:!1}},underlineColor:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'#000000'",computed:!1}},textColor:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'#000000'",computed:!1}}}};const L={title:"Features/AnimatedText",component:v,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{maxWidth:{control:{type:"number",min:100,max:800,step:50},description:"한 줄의 최대 너비 (픽셀)"},fontSize:{control:{type:"number",min:12,max:72,step:2},description:"글자 크기 (픽셀)"},underlineHeight:{control:{type:"number",min:2,max:10,step:1},description:"밑줄 두께 (픽셀)"},underlineColor:{control:"color",description:"밑줄 색상"},textColor:{control:"color",description:"텍스트 색상"}}},x={args:{maxWidth:400,fontSize:24,underlineHeight:4,underlineColor:"#000000",textColor:"#000000"}},g={args:{maxWidth:600,fontSize:36,underlineHeight:6,underlineColor:"#000000",textColor:"#000000"}},f={args:{maxWidth:400,fontSize:24,underlineHeight:4,underlineColor:"#3b82f6",textColor:"#1e40af"}},h={args:{maxWidth:300,fontSize:18,underlineHeight:3,underlineColor:"#000000",textColor:"#000000"}},b={args:{maxWidth:800,fontSize:28,underlineHeight:5,underlineColor:"#ef4444",textColor:"#dc2626"},render:l=>e.jsx("div",{className:"w-[900px]",children:e.jsx(v,{...l})})},C={args:{maxWidth:400,fontSize:24,underlineHeight:4,underlineColor:"#10b981",textColor:"#059669"},render:l=>e.jsxs("div",{children:[e.jsx(v,{...l}),e.jsx("p",{className:"mt-4 text-sm text-gray-500",children:"긴 텍스트를 입력하면 자동으로 줄바꿈됩니다. 각 글자는 -45도에서 45도 사이의 랜덤한 각도로 회전하고, 0.8배에서 1.2배 사이의 크기로 스케일됩니다."})]})};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: 400,
    fontSize: 24,
    underlineHeight: 4,
    underlineColor: '#000000',
    textColor: '#000000'
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: 600,
    fontSize: 36,
    underlineHeight: 6,
    underlineColor: '#000000',
    textColor: '#000000'
  }
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: 400,
    fontSize: 24,
    underlineHeight: 4,
    underlineColor: '#3b82f6',
    textColor: '#1e40af'
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: 300,
    fontSize: 18,
    underlineHeight: 3,
    underlineColor: '#000000',
    textColor: '#000000'
  }
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: 800,
    fontSize: 28,
    underlineHeight: 5,
    underlineColor: '#ef4444',
    textColor: '#dc2626'
  },
  render: args => <div className="w-[900px]">
      <AnimatedText {...args} />
    </div>
}`,...b.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    maxWidth: 400,
    fontSize: 24,
    underlineHeight: 4,
    underlineColor: '#10b981',
    textColor: '#059669'
  },
  render: args => <div>
      <AnimatedText {...args} />
      <p className="mt-4 text-sm text-gray-500">
        긴 텍스트를 입력하면 자동으로 줄바꿈됩니다. 각 글자는 -45도에서 45도 사이의 랜덤한 각도로 회전하고, 0.8배에서 1.2배 사이의 크기로 스케일됩니다.
      </p>
    </div>
}`,...C.parameters?.docs?.source}}};const E=["Default","LargeText","Colored","SmallText","WideContainer","LongText"];export{f as Colored,x as Default,g as LargeText,C as LongText,h as SmallText,b as WideContainer,E as __namedExportsOrder,L as default};
