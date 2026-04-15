/**
 * CDN olmadan Tailwind’in üreteceği yardımcı sınıflar — content.raw ile taranır.
 * (Şablon + editörde sık kullanılanlar; tam kapsam için site-export.css build kullanılır.)
 */
export const tailwindBuilderSafelistForScan = `
min-h-screen min-h-[50px] min-h-[100px] min-h-[800px] min-h-[70vh]
w-full w-24 w-9 max-w-5xl max-w-7xl max-w-2xl max-w-lg max-w-full
min-w-0 h-4 h-5 h-8 w-4 w-5 w-8
sm:block sm:inline sm:flex md:flex md:grid lg:inline lg:flex
text-6xl text-7xl sm:text-7xl md:text-8xl text-2xl text-xl text-sm text-xs text-base text-[10px] text-[11px] text-[13px]
font-black font-bold font-semibold font-medium tracking-tight tracking-wide tracking-wider
text-center text-left text-right
flex flex-col flex-row flex-wrap flex-1 items-center items-start items-stretch justify-between justify-center justify-end gap-0.5 gap-1 gap-1.5 gap-2 gap-4 gap-8
grid grid-cols-2 grid-cols-3 grid-cols-4
p-8 p-6 p-5 p-4 p-3 p-2 p-2.5 p-1.5 px-8 px-6 px-4 px-3 px-2 py-24 py-4 py-3 py-2 py-1.5 py-1 pt-3 pb-4
m-0 mx-auto mt-4 mb-2 mb-3
rounded rounded-md rounded-lg rounded-xl rounded-full rounded-none
border border-b border-t border-dashed border-gray-100 border-gray-200 border-gray-300 border-gray-800 border-blue-200 border-indigo-200
shadow-sm shadow-md transition-colors transition-all duration-150 duration-200
bg-white bg-black bg-gray-50 bg-gray-100 bg-gray-900 bg-gray-950 bg-blue-50 bg-blue-600 bg-indigo-50 bg-red-50 bg-emerald-50
dark:bg-gray-800 dark:bg-gray-900 dark:bg-gray-950 dark:bg-black dark:bg-zinc-950 dark:bg-blue-950
text-gray-400 text-gray-500 text-gray-600 text-gray-700 text-gray-800 text-gray-900 text-white text-blue-500 text-blue-600 text-indigo-200 text-red-600 text-emerald-800
dark:text-gray-200 dark:text-gray-300 dark:text-gray-400 dark:text-white dark:text-blue-400 dark:text-indigo-200 dark:text-red-400 dark:text-emerald-200
hover:bg-gray-800 hover:bg-blue-700 hover:bg-gray-50 hover:bg-gray-100 hover:underline hover:text-blue-800
dark:hover:bg-gray-800 dark:hover:bg-gray-900 dark:hover:border-indigo-600
outline-none outline outline-1 outline-2 outline-dashed outline-blue-400 outline-blue-500 outline-blue-600
ring-2 ring-blue-500
opacity-40 opacity-50 opacity-80 opacity-100
pointer-events-none pointer-events-auto
relative absolute fixed sticky static z-10 z-[1] z-[2] z-[3] z-[80] z-[100]
overflow-hidden overflow-x-auto overflow-y-auto
shrink-0 flex-1 basis-[200px]
translate-x-1/2 translate-y-1/2 -translate-x-1/2 -translate-y-1/2
space-y-1 space-y-2 space-y-5 space-y-6 space-y-8
divide-y
antialiased font-sans font-mono
underline underline-offset-2 decoration-current no-underline
cursor-default cursor-pointer
resize-y
accent-blue-600
line-clamp-2
from-indigo-50 to-transparent bg-gradient-to-b
opacity-0 opacity-100 transition-opacity animate-spin
inline-flex inline-block block
role-group
max-h-[min(42vh,22rem)] max-h-[92vh] max-h-[70vh]
`.replace(/\s+/g, ' ');
