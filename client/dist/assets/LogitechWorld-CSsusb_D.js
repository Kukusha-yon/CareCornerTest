import{j as r}from"./ui-B5PjYYeE.js";import{u as a}from"./index-DBuhCPqP.js";import{c,P as s}from"./productService-rVeuLpxN.js";import{P as d}from"./ProductCard-D3SiKk8O.js";import{C as m}from"./CategoryHero-__bnoUtf.js";import"./vendor-qOmVjXE-.js";import"./Button-BWQtias1.js";import"./formatCurrency-mEhBIXkX.js";const y=()=>{const{data:e,isLoading:t,error:o}=a({queryKey:["products",s.LOGITECH_WORLD],queryFn:()=>c(s.LOGITECH_WORLD)});return t?r.jsx("div",{className:"min-h-screen flex items-center justify-center",children:r.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-[#39b54a]"})}):o?r.jsx("div",{className:"min-h-screen flex items-center justify-center",children:r.jsx("div",{className:"text-red-500",children:"Error loading products. Please try again later."})}):r.jsxs("div",{className:"min-h-screen bg-white",children:[r.jsx(m,{title:"Logitech World",description:"Premium peripherals designed for productivity and comfort in your daily workflow.",image:"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80",ctaText:"Explore Logitech",ctaLink:"/products?category=Logitech World"}),r.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:r.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6",children:e==null?void 0:e.map(i=>r.jsx(d,{product:i},i._id))})})]})};export{y as default};
