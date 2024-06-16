import React from 'react';

function Header({ total }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold">Complete the mission, earn the commission!</h1>
      <p className="text-zinc-400 mt-2">But hey, only qualified actions unlock the Lunar galaxy! ✨</p>
       <div class="w-full rounded-lg p-2 mb-4">
      <p id="T6" class="text-center text-3xl font-bold">
      {total.toLocaleString()}&nbsp; <span class="text-purple-400">Lunar</span>
      </p>
      </div>
    
    </div>
  );
}

export default Header;
