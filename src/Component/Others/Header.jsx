import React from 'react';

function Header({ total }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold">Complete the mission, earn the commission!</h1>
      <p className="text-zinc-400 mt-2">But hey, only qualified actions unlock the Lunar galaxy! ✨</p>
      <p id="T6" className="text-purple-400">{total.toLocaleString()}&nbsp;</p>
    </div>
  );
}

export default Header;
