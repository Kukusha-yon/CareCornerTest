import{j as e,_ as I}from"./ui-B5PjYYeE.js";import{r as a}from"./vendor-qOmVjXE-.js";import{m as Q,u,n as N,V as b}from"./index-DBuhCPqP.js";import{u as Z}from"./useMutation-MTKIpc2f.js";import{g as _,a as U,b as G,c as X,d as Y}from"./adminService-DPTglirL.js";import{u as z,g as O}from"./settingService-BkbaxgG5.js";import{F as H}from"./CurrencyDollarIcon-C73acJ_W.js";import{F as p}from"./ShoppingCartIcon-B0Y84XMM.js";import{F as J,a as S,b as D}from"./UserGroupIcon-DEMhROUh.js";import{f as ee}from"./format-sbWH3_uq.js";function se({title:l,titleId:r,...c},s){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":r},c),l?a.createElement("title",{id:r},l):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"}))}const k=a.forwardRef(se);function te({title:l,titleId:r,...c},s){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":r},c),l?a.createElement("title",{id:r},l):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))}const re=a.forwardRef(te);function ne({title:l,titleId:r,...c},s){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":r},c),l?a.createElement("title",{id:r},l):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))}const ae=a.forwardRef(ne);function le({title:l,titleId:r,...c},s){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":r},c),l?a.createElement("title",{id:r},l):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))}const ie=a.forwardRef(le),Oe=()=>{var f,y,j,w,v;const l=Q(),[r,c]=a.useState("week"),{data:s,isLoading:F,error:ce}=u({queryKey:["dashboard"],queryFn:_,retry:2,refetchOnWindowFocus:!1}),{data:x,isLoading:C,error:oe}=u({queryKey:["stats",r],queryFn:()=>U(r),retry:2,refetchOnWindowFocus:!1}),{data:n,isLoading:$,error:de}=u({queryKey:["orderStats",r],queryFn:()=>G(r),retry:2,refetchOnWindowFocus:!1}),{data:o,isLoading:R,error:me}=u({queryKey:["productStats",r],queryFn:()=>X(r),retry:2,refetchOnWindowFocus:!1}),{data:d,isLoading:E,error:xe}=u({queryKey:["customerStats",r],queryFn:()=>Y(r),retry:2,refetchOnWindowFocus:!1}),{data:m}=u({queryKey:["setting","acceptOrders"],queryFn:()=>O("acceptOrders")}),{data:ge}=u({queryKey:["setting","contactInfo"],queryFn:()=>O("contactInfo")}),L=Z({mutationFn:t=>z("acceptOrders",t),onSuccess:()=>{l.invalidateQueries(["setting","acceptOrders"]),b.success("Order acceptance setting updated successfully")},onError:t=>{b.error(t.message||"Failed to update order acceptance setting")}}),q=t=>{L.mutate(t)};if(F||C||$||R||E)return e.jsx("div",{className:"flex items-center justify-center min-h-screen",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39b54a]"})});const i=(t,g)=>g?(t-g)/g*100:0,T=[{name:"Total Revenue",value:`$${((f=s==null?void 0:s.totalRevenue)==null?void 0:f.toFixed(2))||"0.00"}`,change:`${i(s==null?void 0:s.totalRevenue,n==null?void 0:n.totalRevenue)>0?"+":""}${i(s==null?void 0:s.totalRevenue,n==null?void 0:n.totalRevenue).toFixed(2)}%`,changeType:i(s==null?void 0:s.totalRevenue,n==null?void 0:n.totalRevenue)>=0?"increase":"decrease",icon:H,color:"bg-blue-500"},{name:"Total Orders",value:(s==null?void 0:s.totalOrders)||0,change:`${i(s==null?void 0:s.totalOrders,n==null?void 0:n.totalOrders)>0?"+":""}${i(s==null?void 0:s.totalOrders,n==null?void 0:n.totalOrders).toFixed(2)}%`,changeType:i(s==null?void 0:s.totalOrders,n==null?void 0:n.totalOrders)>=0?"increase":"decrease",icon:p,color:"bg-[#39b54a]"},{name:"Total Customers",value:(s==null?void 0:s.totalCustomers)||0,change:`${i(s==null?void 0:s.totalCustomers,d==null?void 0:d.totalCustomers)>0?"+":""}${i(s==null?void 0:s.totalCustomers,d==null?void 0:d.totalCustomers).toFixed(2)}%`,changeType:i(s==null?void 0:s.totalCustomers,d==null?void 0:d.totalCustomers)>=0?"increase":"decrease",icon:J,color:"bg-purple-500"},{name:"Average Order Value",value:`$${((y=s==null?void 0:s.averageOrderValue)==null?void 0:y.toFixed(2))||"0.00"}`,change:`${i(s==null?void 0:s.averageOrderValue,o==null?void 0:o.averageOrderValue)>0?"+":""}${i(s==null?void 0:s.averageOrderValue,o==null?void 0:o.averageOrderValue).toFixed(2)}%`,changeType:i(s==null?void 0:s.averageOrderValue,o==null?void 0:o.averageOrderValue)>=0?"increase":"decrease",icon:N,color:"bg-amber-500"}],h=t=>{if(!(s!=null&&s.orderStatusDistribution))return 0;const g=s.orderStatusDistribution.find(B=>B.status===t);return g?g.count:0},V=h("pending"),M=h("processing"),W=h("shipped"),A=h("delivered"),P=h("cancelled"),K=t=>{try{return ee(new Date(t),"MMM d, yyyy")}catch{return t}};return e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"bg-white rounded-lg shadow p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Order Acceptance"}),e.jsx("p",{className:"text-sm text-gray-500",children:"Toggle whether the system accepts new orders"})]}),e.jsx(I,{checked:(m==null?void 0:m.value)??!0,onChange:q,className:`${m!=null&&m.value?"bg-[#39b54a]":"bg-gray-200"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#39b54a] focus:ring-offset-2`,children:e.jsx("span",{className:`${m!=null&&m.value?"translate-x-6":"translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`})})]})}),e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-semibold text-gray-900",children:"Dashboard"}),e.jsx("p",{className:"text-sm text-gray-500 mt-1",children:"Welcome to your admin dashboard"})]}),e.jsxs("div",{className:"flex items-center bg-white rounded-lg shadow-sm p-1",children:[e.jsx("button",{onClick:()=>c("week"),className:`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${r==="week"?"bg-[#39b54a] text-white":"text-gray-500 hover:text-gray-700"}`,children:"Week"}),e.jsx("button",{onClick:()=>c("month"),className:`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${r==="month"?"bg-[#39b54a] text-white":"text-gray-500 hover:text-gray-700"}`,children:"Month"}),e.jsx("button",{onClick:()=>c("year"),className:`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${r==="year"?"bg-[#39b54a] text-white":"text-gray-500 hover:text-gray-700"}`,children:"Year"})]})]}),e.jsx("div",{className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",children:T.map(t=>e.jsxs("div",{className:"relative overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm transition-all hover:shadow-md sm:px-6 sm:py-6",children:[e.jsxs("dt",{children:[e.jsx("div",{className:`absolute rounded-lg ${t.color} p-3`,children:e.jsx(t.icon,{className:"h-6 w-6 text-white","aria-hidden":"true"})}),e.jsx("p",{className:"ml-16 truncate text-sm font-medium text-gray-500",children:t.name})]}),e.jsxs("dd",{className:"ml-16 flex items-baseline pb-6 sm:pb-7",children:[e.jsx("p",{className:"text-2xl font-semibold text-gray-900",children:t.value}),e.jsxs("p",{className:`ml-2 flex items-baseline text-sm font-semibold ${t.changeType==="increase"?"text-green-600":"text-red-600"}`,children:[t.changeType==="increase"?e.jsx(S,{className:"h-5 w-5 flex-shrink-0 self-center text-green-500","aria-hidden":"true"}):e.jsx(D,{className:"h-5 w-5 flex-shrink-0 self-center text-red-500","aria-hidden":"true"}),e.jsxs("span",{className:"sr-only",children:[t.changeType==="increase"?"Increased":"Decreased"," by"]}),t.change]})]})]},t.name))}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5",children:[e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3",children:[e.jsx("div",{className:"bg-yellow-100 p-2 rounded-lg",children:e.jsx(ae,{className:"h-6 w-6 text-yellow-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-500",children:"Pending"}),e.jsx("p",{className:"text-xl font-semibold text-gray-900",children:V})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3",children:[e.jsx("div",{className:"bg-blue-100 p-2 rounded-lg",children:e.jsx(k,{className:"h-6 w-6 text-blue-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-500",children:"Processing"}),e.jsx("p",{className:"text-xl font-semibold text-gray-900",children:M})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3",children:[e.jsx("div",{className:"bg-indigo-100 p-2 rounded-lg",children:e.jsx(p,{className:"h-6 w-6 text-indigo-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-500",children:"Shipped"}),e.jsx("p",{className:"text-xl font-semibold text-gray-900",children:W})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3",children:[e.jsx("div",{className:"bg-green-100 p-2 rounded-lg",children:e.jsx(re,{className:"h-6 w-6 text-green-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-500",children:"Delivered"}),e.jsx("p",{className:"text-xl font-semibold text-gray-900",children:A})]})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3",children:[e.jsx("div",{className:"bg-red-100 p-2 rounded-lg",children:e.jsx(ie,{className:"h-6 w-6 text-red-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-500",children:"Cancelled"}),e.jsx("p",{className:"text-xl font-semibold text-gray-900",children:P})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 gap-5 lg:grid-cols-2",children:[e.jsxs("div",{className:"bg-white shadow-sm rounded-xl overflow-hidden",children:[e.jsx("div",{className:"p-6 border-b border-gray-100",children:e.jsxs("h2",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(p,{className:"h-5 w-5 mr-2 text-[#39b54a]"}),"Recent Orders"]})}),e.jsx("div",{className:"flow-root",children:e.jsx("ul",{role:"list",className:"divide-y divide-gray-100",children:((j=s==null?void 0:s.recentOrders)==null?void 0:j.length)>0?s.recentOrders.map(t=>e.jsx("li",{className:"p-4 hover:bg-gray-50 transition-colors",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium text-gray-900 truncate",children:t.customer}),e.jsx("div",{className:"flex items-center mt-1",children:e.jsxs("p",{className:"text-xs text-gray-500",children:["Order #",t.id.substring(0,8)," • ",K(t.date)]})})]}),e.jsxs("div",{className:"flex flex-col items-end",children:[e.jsxs("span",{className:"text-sm font-medium text-gray-900",children:["$",t.amount.toFixed(2)]}),e.jsx("span",{className:`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.status==="delivered"?"bg-green-100 text-green-800":t.status==="pending"?"bg-yellow-100 text-yellow-800":t.status==="processing"?"bg-blue-100 text-blue-800":t.status==="shipped"?"bg-indigo-100 text-indigo-800":"bg-red-100 text-red-800"}`,children:t.status.charAt(0).toUpperCase()+t.status.slice(1)})]})]})},t.id)):e.jsx("li",{className:"p-4 text-center text-gray-500",children:"No recent orders"})})}),e.jsx("div",{className:"bg-gray-50 px-6 py-3 border-t border-gray-100",children:e.jsx("a",{href:"/admin/orders",className:"text-sm font-medium text-[#39b54a] hover:text-[#2d9240]",children:"View all orders"})})]}),e.jsxs("div",{className:"bg-white shadow-sm rounded-xl overflow-hidden",children:[e.jsx("div",{className:"p-6 border-b border-gray-100",children:e.jsxs("h2",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(N,{className:"h-5 w-5 mr-2 text-[#39b54a]"}),"Sales by Category"]})}),e.jsx("div",{className:"flow-root",children:e.jsx("ul",{role:"list",className:"divide-y divide-gray-100",children:((w=x==null?void 0:x.salesByCategory)==null?void 0:w.length)>0?x.salesByCategory.map(t=>e.jsx("li",{className:"p-4 hover:bg-gray-50 transition-colors",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx("p",{className:"text-sm font-medium text-gray-900 truncate",children:t.category})}),e.jsx("div",{className:"flex items-center",children:e.jsxs("span",{className:"text-sm font-medium text-gray-900",children:["$",t.total.toFixed(2)]})})]})},t.category)):e.jsx("li",{className:"p-4 text-center text-gray-500",children:"No category data available"})})}),e.jsx("div",{className:"bg-gray-50 px-6 py-3 border-t border-gray-100",children:e.jsx("a",{href:"/admin/products",className:"text-sm font-medium text-[#39b54a] hover:text-[#2d9240]",children:"View all products"})})]})]}),e.jsxs("div",{className:"bg-white shadow-sm rounded-xl overflow-hidden",children:[e.jsx("div",{className:"p-6 border-b border-gray-100",children:e.jsxs("h2",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(k,{className:"h-5 w-5 mr-2 text-[#39b54a]"}),"Top Products"]})}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"min-w-full divide-y divide-gray-100",children:[e.jsx("thead",{className:"bg-gray-50",children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Product"}),e.jsx("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Category"}),e.jsx("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Sales"}),e.jsx("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Stock"})]})}),e.jsx("tbody",{className:"bg-white divide-y divide-gray-100",children:((v=x==null?void 0:x.topProducts)==null?void 0:v.length)>0?x.topProducts.map(t=>e.jsxs("tr",{className:"hover:bg-gray-50 transition-colors",children:[e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",children:t.name}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:t.category||"N/A"}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:t.sales}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:t.stock||"N/A"})]},t._id)):e.jsx("tr",{children:e.jsx("td",{colSpan:"4",className:"px-6 py-4 text-center text-sm text-gray-500",children:"No product data available"})})})]})})]})]})};export{Oe as default};
