import React from 'react'

const Loading = ({ text, subtitle }) => {
  return (
    <>  
    <div className="flex flex-col items-center justify-center mt-24 text-center h-screen w-full">

  {/* Spinner */}
  <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin shadow-[0_0_30px_rgba(236,72,153,0.4)]"></div>

  {/* Text */}
  <h2 className="mt-8 text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 bg-clip-text text-transparent tracking-tight">
     {text}
  </h2>

  {/* Subtitle */}
  <p className="mt-3 text-zinc-400 text-lg max-w-md">
    {subtitle}
  </p>

</div>
    </>
  )
}

export default Loading