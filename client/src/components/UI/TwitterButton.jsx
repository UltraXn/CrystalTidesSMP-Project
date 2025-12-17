
const TwitterButton = () => {
    return (
      <div className="flex flex-col gap-6 max-w-sm mx-auto relative z-10 mt-8">
        <a href="https://x.com/KilluBysmali" target="_blank" rel="noopener noreferrer" className="block w-full"> 
          <button className="group relative w-full p-4 rounded-2xl backdrop-blur-xl border-2 border-sky-500/30 bg-gradient-to-br from-sky-900/90 to-[#0B0C10] shadow-2xl hover:shadow-sky-500/30 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all duration-500 ease-out cursor-pointer hover:border-sky-400/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/10 via-sky-400/20 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-sky-500/30 to-sky-600/10 backdrop-blur-sm group-hover:from-sky-400/40 group-hover:to-sky-500/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7 fill-current text-sky-400 group-hover:text-sky-300 transition-all duration-300 group-hover:scale-110 drop-shadow-lg">
                    {/* Classic Twitter Bird Icon SVG */}
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                  </svg>
              </div>
              <div className="flex-1 text-left">
                  <p className="text-sky-400 font-bold text-lg group-hover:text-sky-300 transition-colors duration-300 drop-shadow-sm">
                  Twitter
                  </p>
                  <p className="text-sky-300/60 text-sm group-hover:text-sky-200/80 transition-colors duration-300">
                  ¡Sigue los tweets de Killubysmali!
                  </p>
              </div>
              <div className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-5 h-5 text-sky-400">
                  <path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
              </div>
              </div>
          </button>
        </a>
      </div>
    );
  }
  
  export default TwitterButton;
