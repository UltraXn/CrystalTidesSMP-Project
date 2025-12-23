
const TwitchButton = () => {
    return (
      <div className="flex flex-col gap-6 max-w-sm mx-auto relative z-10 mt-8">
        <a href="https://www.twitch.tv/killubysmali" target="_blank" rel="noopener noreferrer" className="block w-full"> 
          <button className="group relative w-full p-4 rounded-2xl backdrop-blur-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/90 to-[#0B0C10] shadow-2xl hover:shadow-purple-500/30 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all duration-500 ease-out cursor-pointer hover:border-purple-400/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-400/20 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/10 backdrop-blur-sm group-hover:from-purple-400/40 group-hover:to-purple-500/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7 fill-current text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:scale-110 drop-shadow-lg">
                    {/* Twitch Icon SVG */}
                    <path d="M391.17,103.47H352.5v102h38.67Zm-102,0H250.5v102h38.67ZM128,0,94.08,82.85V446.85H202.5V512H271.3l62.8-65.15H429.35L512,244.95V0ZM476.5,227.1,419.66,284H316L259.08,340.92V284H157.65V35.45H476.5Z"/>
                  </svg>
              </div>
              <div className="flex-1 text-left">
                  <p className="text-purple-400 font-bold text-lg group-hover:text-purple-300 transition-colors duration-300 drop-shadow-sm">
                  Twitch
                  </p>
                  <p className="text-purple-300/60 text-sm group-hover:text-purple-200/80 transition-colors duration-300">
                  ¡Sigue los directos de Killubysmali!
                  </p>
              </div>
              <div className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-5 h-5 text-purple-400">
                  <path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
              </div>
              </div>
          </button>
        </a>
      </div>
    );
  }
  
  export default TwitchButton;
