import React from 'react'

const BackgroundGlow = () => {
  return (
  <>
     <div className="absolute top-[-150px] left-[20%] w-[500px] h-[500px] bg-pink-500/20 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[10%] w-[500px] h-[500px] bg-red-500/10 blur-[160px] rounded-full pointer-events-none"></div>
        </>
    )
}

export default BackgroundGlow