import{j as e,d as i}from"./ui-B5PjYYeE.js";import{u as d}from"./index-DBuhCPqP.js";import{L as a}from"./vendor-qOmVjXE-.js";import{b as o}from"./productService-rVeuLpxN.js";const h=()=>{const{data:t,isLoading:r,error:l}=d({queryKey:["featuredProducts"],queryFn:o});return r?e.jsx("div",{className:"container mx-auto px-4 py-8",children:e.jsxs("div",{className:"animate-pulse",children:[e.jsx("div",{className:"h-8 bg-gray-200 rounded w-1/4 mb-6"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:[1,2,3,4,5,6].map(s=>e.jsx("div",{className:"bg-gray-200 rounded-lg h-64"},s))})]})}):l?e.jsx("div",{className:"container mx-auto px-4 py-8",children:e.jsx("div",{className:"text-center text-red-600",children:"Error loading featured products. Please try again later."})}):e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsx("div",{className:"mb-8",children:e.jsxs(a,{to:"/",className:"text-blue-600 hover:text-blue-700 flex items-center gap-1",children:[e.jsx(i,{size:16}),"Back to Home"]})}),e.jsx("h1",{className:"text-3xl font-bold mb-8",children:"Featured Products"}),t!=null&&t.length?e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:t.map(s=>e.jsxs(a,{to:s.link,className:"group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300",children:[e.jsxs("div",{className:"relative aspect-w-16 aspect-h-9",children:[e.jsx("img",{src:s.image,alt:s.title,className:"object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"}),s.highlightText&&e.jsx("div",{className:"absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm",children:s.highlightText})]}),e.jsxs("div",{className:"p-4",children:[e.jsx("h3",{className:"text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-300",children:s.title}),e.jsx("p",{className:"text-gray-600 text-sm mb-4 line-clamp-2",children:s.description}),s.buttonText&&e.jsx("span",{className:"inline-flex items-center text-blue-600 hover:text-blue-700",children:s.buttonText})]})]},s._id))}):e.jsx("div",{className:"text-center text-gray-600",children:"No featured products available at the moment."})]})};export{h as default};
