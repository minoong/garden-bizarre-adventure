import{j as e}from"./jsx-runtime-DOb6h6Kl.js";import{r as x}from"./iframe-G1VcDnq5.js";import"./preload-helper-PPVm8Dsz.js";function T(i,t){return`${i}는 반드시 ${t} 안에서 사용되어야 합니다.`}function P(i={}){const{name:t,strict:d=!0,hookName:r="useContext",providerName:c="Provider",errorMessage:b,defaultValue:s}=i,l=x.createContext(s);l.displayName=t;function n(){const o=x.useContext(l);if(!o&&d){const m=new Error(b??T(r,c));throw m.name="ContextError",Error.captureStackTrace&&Error.captureStackTrace(m,n),m}return o}return[l.Provider,n,l]}const[R,h]=P({name:"TabContext",hookName:"useTabContext",providerName:"TabProvider",errorMessage:T("useTabContext","TabProvider")}),N=i=>{const{children:t,className:d,"aria-label":r}=i,{tabsId:c}=h(),b=x.useCallback(s=>{const l=Array.from(s.currentTarget.querySelectorAll('[role="tab"]')),n=l.findIndex(m=>m===document.activeElement);let o=n;s.key==="ArrowLeft"?o=n>0?n-1:l.length-1:s.key==="ArrowRight"&&(o=n<l.length-1?n+1:0),o!==n&&(s.preventDefault(),l[o].focus(),l[o].click())},[]);return e.jsx("div",{role:"tablist","aria-label":r,"aria-orientation":"horizontal",className:d,onKeyDown:b,id:`${c}-tablist`,children:t})};N.__docgenInfo={description:"",methods:[],displayName:"TabList",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},"aria-label":{required:!1,tsType:{name:"string"},description:""}}};const f=({children:i,value:t,className:d,forceMount:r=!1})=>{const{activeTab:c,tabsId:b}=h(),s=c===t;return!r&&!s?null:e.jsx("div",{role:"tabpanel","aria-labelledby":`${b}-trigger-${t}`,id:`${b}-panel-${t}`,tabIndex:0,className:d,"data-state":s?"active":"inactive",hidden:!s,children:i})};f.__docgenInfo={description:"",methods:[],displayName:"TabPanel",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},value:{required:!0,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:""},forceMount:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const j=i=>{const{children:t,defaultValue:d,value:r,onValueChange:c}=i,[b,s]=x.useState(d||""),l=x.useId(),n=r!==void 0?r:b,o=x.useCallback(m=>{r===void 0&&s(m),c?.(m)},[r,c]);return e.jsx(R,{value:{activeTab:n,setActiveTab:o,tabsId:l},children:t})};j.__docgenInfo={description:"",methods:[],displayName:"TabRoot",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},defaultValue:{required:!1,tsType:{name:"string"},description:""},value:{required:!1,tsType:{name:"string"},description:""},onValueChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""}}};const w=i=>{const{children:t,value:d,disabled:r=!1,className:c}=i,{activeTab:b,setActiveTab:s,tabsId:l}=h(),n=b===d,o=x.useCallback(()=>{r||s(d)},[r,s,d]);return e.jsx("button",{role:"tab","aria-selected":n,"aria-controls":`${l}-tabpanel-${d}`,id:`${l}-tab-${d}`,tabIndex:n?0:-1,disabled:r,className:c,onClick:o,"data-state":n?"active":"inactive","data-disabled":r?"":void 0,children:t})};w.__docgenInfo={description:"",methods:[],displayName:"TabTrigger",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},value:{required:!0,tsType:{name:"string"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const a={Root:j,List:N,Trigger:w,Panel:f},L={title:"Features/Tabs",component:a.Root,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{defaultValue:{control:"text",description:"기본 선택될 탭 값"},value:{control:"text",description:"제어된 모드에서의 현재 탭 값"}}},g={render:()=>e.jsx("div",{className:"w-96",children:e.jsxs(a.Root,{defaultValue:"tab1",children:[e.jsxs(a.List,{"aria-label":"메인 탭",className:"flex rounded-t-lg border-b border-gray-200 bg-gray-50",children:[e.jsx(a.Trigger,{value:"tab1",className:"flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600",children:"탭 1"}),e.jsx(a.Trigger,{value:"tab2",className:"flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600",children:"탭 2"}),e.jsx(a.Trigger,{value:"tab3",className:"flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600",children:"탭 3"})]}),e.jsxs(a.Panel,{value:"tab1",className:"rounded-b-lg border border-t-0 border-gray-200 bg-white p-6",children:[e.jsx("h3",{className:"mb-2 text-lg font-semibold",children:"첫 번째 탭 콘텐츠"}),e.jsx("p",{className:"text-gray-600",children:"이것은 첫 번째 탭의 콘텐츠입니다. 여기에 다양한 내용을 넣을 수 있습니다."})]}),e.jsxs(a.Panel,{value:"tab2",className:"rounded-b-lg border border-t-0 border-gray-200 bg-white p-6",children:[e.jsx("h3",{className:"mb-2 text-lg font-semibold",children:"두 번째 탭 콘텐츠"}),e.jsx("p",{className:"text-gray-600",children:"이것은 두 번째 탭의 콘텐츠입니다. 키보드 화살표 키로 탭 간 이동이 가능합니다."})]}),e.jsxs(a.Panel,{value:"tab3",className:"rounded-b-lg border border-t-0 border-gray-200 bg-white p-6",children:[e.jsx("h3",{className:"mb-2 text-lg font-semibold",children:"세 번째 탭 콘텐츠"}),e.jsx("p",{className:"text-gray-600",children:"이것은 세 번째 탭의 콘텐츠입니다. 각 탭은 접근성을 위한 ARIA 속성들을 가지고 있습니다."})]})]})})},u={render:()=>{const[i,t]=x.useState("settings");return e.jsxs("div",{className:"w-96",children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("p",{className:"mb-2 text-sm text-gray-600",children:"외부에서 탭 제어:"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>t("profile"),className:"rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200",children:"프로필로 이동"}),e.jsx("button",{onClick:()=>t("settings"),className:"rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200",children:"설정으로 이동"})]})]}),e.jsxs(a.Root,{value:i,onValueChange:t,children:[e.jsxs(a.List,{"aria-label":"계정 설정",className:"flex rounded-lg bg-gray-100 p-1",children:[e.jsx(a.Trigger,{value:"profile",className:"flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",children:"프로필"}),e.jsx(a.Trigger,{value:"settings",className:"flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",children:"설정"}),e.jsx(a.Trigger,{value:"billing",className:"flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",children:"결제"})]}),e.jsx(a.Panel,{value:"profile",className:"mt-4 rounded-lg bg-gray-50 p-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700",children:"이름"}),e.jsx("input",{type:"text",className:"mt-1 block w-full rounded-md border border-gray-300 px-3 py-2",defaultValue:"홍길동"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700",children:"이메일"}),e.jsx("input",{type:"email",className:"mt-1 block w-full rounded-md border border-gray-300 px-3 py-2",defaultValue:"hong@example.com"})]})]})}),e.jsx(a.Panel,{value:"settings",className:"mt-4 rounded-lg bg-gray-50 p-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm font-medium text-gray-700",children:"알림 받기"}),e.jsx("input",{type:"checkbox",defaultChecked:!0,className:"rounded"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm font-medium text-gray-700",children:"다크 모드"}),e.jsx("input",{type:"checkbox",className:"rounded"})]})]})}),e.jsx(a.Panel,{value:"billing",className:"mt-4 rounded-lg bg-gray-50 p-4",children:e.jsxs("div",{className:"py-8 text-center",children:[e.jsx("p",{className:"text-gray-600",children:"결제 정보가 없습니다."}),e.jsx("button",{className:"mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700",children:"결제 방법 추가"})]})})]})]})}},p={render:()=>e.jsx("div",{className:"w-96",children:e.jsxs(a.Root,{defaultValue:"available1",children:[e.jsxs(a.List,{"aria-label":"기능 탭",className:"flex border-b border-gray-200",children:[e.jsx(a.Trigger,{value:"available1",className:"px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",children:"사용 가능"}),e.jsx(a.Trigger,{value:"disabled",disabled:!0,className:"cursor-not-allowed px-4 py-2 text-sm font-medium text-gray-400 data-[disabled]:opacity-50",children:"비활성화됨"}),e.jsx(a.Trigger,{value:"available2",className:"px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",children:"다른 탭"})]}),e.jsx(a.Panel,{value:"available1",className:"p-4",children:e.jsx("p",{children:"첫 번째 사용 가능한 탭의 콘텐츠입니다."})}),e.jsx(a.Panel,{value:"disabled",className:"p-4",children:e.jsx("p",{children:"이 콘텐츠는 탭이 비활성화되어 있어 보이지 않습니다."})}),e.jsx(a.Panel,{value:"available2",className:"p-4",children:e.jsx("p",{children:"두 번째 사용 가능한 탭의 콘텐츠입니다."})})]})})},v={render:()=>e.jsx("div",{className:"flex h-64 w-96",children:e.jsxs(a.Root,{defaultValue:"overview",children:[e.jsxs(a.List,{"aria-label":"세로 탭",className:"flex w-32 flex-col border-r border-gray-200 pr-2",children:[e.jsx(a.Trigger,{value:"overview",className:"mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700",children:"개요"}),e.jsx(a.Trigger,{value:"analytics",className:"mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700",children:"분석"}),e.jsx(a.Trigger,{value:"reports",className:"mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700",children:"리포트"}),e.jsx(a.Trigger,{value:"team",className:"mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700",children:"팀"})]}),e.jsxs("div",{className:"flex-1 pl-4",children:[e.jsxs(a.Panel,{value:"overview",className:"h-full",children:[e.jsx("h3",{className:"mb-2 font-semibold",children:"프로젝트 개요"}),e.jsx("p",{className:"text-sm text-gray-600",children:"프로젝트의 전반적인 상태와 주요 지표를 확인할 수 있습니다."})]}),e.jsxs(a.Panel,{value:"analytics",className:"h-full",children:[e.jsx("h3",{className:"mb-2 font-semibold",children:"분석 데이터"}),e.jsx("p",{className:"text-sm text-gray-600",children:"사용자 행동 분석과 성능 지표를 확인할 수 있습니다."})]}),e.jsxs(a.Panel,{value:"reports",className:"h-full",children:[e.jsx("h3",{className:"mb-2 font-semibold",children:"리포트"}),e.jsx("p",{className:"text-sm text-gray-600",children:"월간, 주간 리포트와 커스텀 리포트를 생성할 수 있습니다."})]}),e.jsxs(a.Panel,{value:"team",className:"h-full",children:[e.jsx("h3",{className:"mb-2 font-semibold",children:"팀 관리"}),e.jsx("p",{className:"text-sm text-gray-600",children:"팀원 초대, 권한 관리, 협업 도구를 설정할 수 있습니다."})]})]})]})})},y={render:()=>e.jsx("div",{className:"w-96",children:e.jsxs(a.Root,{defaultValue:"tab1",children:[e.jsxs(a.List,{"aria-label":"강제 마운트 예시",className:"flex border-b border-gray-200",children:[e.jsx(a.Trigger,{value:"tab1",className:"px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",children:"일반 탭"}),e.jsx(a.Trigger,{value:"tab2",className:"px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",children:"강제 마운트 탭"})]}),e.jsxs(a.Panel,{value:"tab1",className:"border border-t-0 border-gray-200 p-4",children:[e.jsx("p",{children:"이 탭은 선택될 때만 렌더링됩니다."}),e.jsx("p",{className:"mt-2 text-sm text-gray-500",children:"개발자 도구에서 DOM을 확인해보세요."})]}),e.jsxs(a.Panel,{value:"tab2",forceMount:!0,className:"border border-t-0 border-gray-200 p-4",children:[e.jsx("p",{children:"이 탭은 항상 DOM에 마운트되어 있습니다."}),e.jsx("p",{className:"mt-2 text-sm text-gray-500",children:"forceMount 속성으로 인해 선택되지 않아도 DOM에 존재합니다."}),e.jsx("input",{type:"text",placeholder:"상태가 유지됩니다",className:"mt-2 rounded-md border border-gray-300 px-3 py-2"})]})]})})};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-96">
      <Tab.Root defaultValue="tab1">
        <Tab.List aria-label="메인 탭" className="flex rounded-t-lg border-b border-gray-200 bg-gray-50">
          <Tab.Trigger value="tab1" className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            탭 1
          </Tab.Trigger>
          <Tab.Trigger value="tab2" className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            탭 2
          </Tab.Trigger>
          <Tab.Trigger value="tab3" className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            탭 3
          </Tab.Trigger>
        </Tab.List>
        <Tab.Panel value="tab1" className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold">첫 번째 탭 콘텐츠</h3>
          <p className="text-gray-600">이것은 첫 번째 탭의 콘텐츠입니다. 여기에 다양한 내용을 넣을 수 있습니다.</p>
        </Tab.Panel>
        <Tab.Panel value="tab2" className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold">두 번째 탭 콘텐츠</h3>
          <p className="text-gray-600">이것은 두 번째 탭의 콘텐츠입니다. 키보드 화살표 키로 탭 간 이동이 가능합니다.</p>
        </Tab.Panel>
        <Tab.Panel value="tab3" className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold">세 번째 탭 콘텐츠</h3>
          <p className="text-gray-600">이것은 세 번째 탭의 콘텐츠입니다. 각 탭은 접근성을 위한 ARIA 속성들을 가지고 있습니다.</p>
        </Tab.Panel>
      </Tab.Root>
    </div>
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [activeTab, setActiveTab] = useState('settings');
    return <div className="w-96">
        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">외부에서 탭 제어:</p>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('profile')} className="rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200">
              프로필로 이동
            </button>
            <button onClick={() => setActiveTab('settings')} className="rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200">
              설정으로 이동
            </button>
          </div>
        </div>

        <Tab.Root value={activeTab} onValueChange={setActiveTab}>
          <Tab.List aria-label="계정 설정" className="flex rounded-lg bg-gray-100 p-1">
            <Tab.Trigger value="profile" className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              프로필
            </Tab.Trigger>
            <Tab.Trigger value="settings" className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              설정
            </Tab.Trigger>
            <Tab.Trigger value="billing" className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              결제
            </Tab.Trigger>
          </Tab.List>

          <Tab.Panel value="profile" className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="홍길동" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" defaultValue="hong@example.com" />
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel value="settings" className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">알림 받기</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">다크 모드</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel value="billing" className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="py-8 text-center">
              <p className="text-gray-600">결제 정보가 없습니다.</p>
              <button className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">결제 방법 추가</button>
            </div>
          </Tab.Panel>
        </Tab.Root>
      </div>;
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-96">
      <Tab.Root defaultValue="available1">
        <Tab.List aria-label="기능 탭" className="flex border-b border-gray-200">
          <Tab.Trigger value="available1" className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
            사용 가능
          </Tab.Trigger>
          <Tab.Trigger value="disabled" disabled className="cursor-not-allowed px-4 py-2 text-sm font-medium text-gray-400 data-[disabled]:opacity-50">
            비활성화됨
          </Tab.Trigger>
          <Tab.Trigger value="available2" className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
            다른 탭
          </Tab.Trigger>
        </Tab.List>

        <Tab.Panel value="available1" className="p-4">
          <p>첫 번째 사용 가능한 탭의 콘텐츠입니다.</p>
        </Tab.Panel>

        <Tab.Panel value="disabled" className="p-4">
          <p>이 콘텐츠는 탭이 비활성화되어 있어 보이지 않습니다.</p>
        </Tab.Panel>

        <Tab.Panel value="available2" className="p-4">
          <p>두 번째 사용 가능한 탭의 콘텐츠입니다.</p>
        </Tab.Panel>
      </Tab.Root>
    </div>
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-64 w-96">
      <Tab.Root defaultValue="overview">
        <Tab.List aria-label="세로 탭" className="flex w-32 flex-col border-r border-gray-200 pr-2">
          <Tab.Trigger value="overview" className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            개요
          </Tab.Trigger>
          <Tab.Trigger value="analytics" className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            분석
          </Tab.Trigger>
          <Tab.Trigger value="reports" className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            리포트
          </Tab.Trigger>
          <Tab.Trigger value="team" className="mb-1 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            팀
          </Tab.Trigger>
        </Tab.List>

        <div className="flex-1 pl-4">
          <Tab.Panel value="overview" className="h-full">
            <h3 className="mb-2 font-semibold">프로젝트 개요</h3>
            <p className="text-sm text-gray-600">프로젝트의 전반적인 상태와 주요 지표를 확인할 수 있습니다.</p>
          </Tab.Panel>

          <Tab.Panel value="analytics" className="h-full">
            <h3 className="mb-2 font-semibold">분석 데이터</h3>
            <p className="text-sm text-gray-600">사용자 행동 분석과 성능 지표를 확인할 수 있습니다.</p>
          </Tab.Panel>

          <Tab.Panel value="reports" className="h-full">
            <h3 className="mb-2 font-semibold">리포트</h3>
            <p className="text-sm text-gray-600">월간, 주간 리포트와 커스텀 리포트를 생성할 수 있습니다.</p>
          </Tab.Panel>

          <Tab.Panel value="team" className="h-full">
            <h3 className="mb-2 font-semibold">팀 관리</h3>
            <p className="text-sm text-gray-600">팀원 초대, 권한 관리, 협업 도구를 설정할 수 있습니다.</p>
          </Tab.Panel>
        </div>
      </Tab.Root>
    </div>
}`,...v.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-96">
      <Tab.Root defaultValue="tab1">
        <Tab.List aria-label="강제 마운트 예시" className="flex border-b border-gray-200">
          <Tab.Trigger value="tab1" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
            일반 탭
          </Tab.Trigger>
          <Tab.Trigger value="tab2" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
            강제 마운트 탭
          </Tab.Trigger>
        </Tab.List>

        <Tab.Panel value="tab1" className="border border-t-0 border-gray-200 p-4">
          <p>이 탭은 선택될 때만 렌더링됩니다.</p>
          <p className="mt-2 text-sm text-gray-500">개발자 도구에서 DOM을 확인해보세요.</p>
        </Tab.Panel>

        <Tab.Panel value="tab2" forceMount className="border border-t-0 border-gray-200 p-4">
          <p>이 탭은 항상 DOM에 마운트되어 있습니다.</p>
          <p className="mt-2 text-sm text-gray-500">forceMount 속성으로 인해 선택되지 않아도 DOM에 존재합니다.</p>
          <input type="text" placeholder="상태가 유지됩니다" className="mt-2 rounded-md border border-gray-300 px-3 py-2" />
        </Tab.Panel>
      </Tab.Root>
    </div>
}`,...y.parameters?.docs?.source}}};const A=["Default","Controlled","WithDisabledTab","VerticalTabs","ForceMount"];export{u as Controlled,g as Default,y as ForceMount,v as VerticalTabs,p as WithDisabledTab,A as __namedExportsOrder,L as default};
