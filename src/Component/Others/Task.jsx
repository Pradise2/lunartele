import React, { useState } from 'react';

function Task({ title, points, onClaim }) {
  const [status, setStatus] = useState('start');
  const [buttonText, setButtonText] = useState('Start');

  const handleClick = () => {
    if (status === 'start') {
      setStatus('go');
      setButtonText('Go');
    } else if (status === 'go') {
      setStatus('check');
      setButtonText('Check');
    } else if (status === 'check') {
      setStatus('claim');
      setButtonText('Claim');
      setTimeout(() => {
        setButtonText('Claim');
      }, 10000);
    } else if (status === 'claim') {
      onClaim(points);
    }
  };

  return (
    <div id="T9" className="bg-zinc-800 rounded-lg p-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-purple-400" id="A4">{points.toLocaleString()}&nbsp;</p>
        </div>
        <div id="T2" className="flex space-x-2">
          <button
            id="A1"
            className={`bg-${status === 'check' ? 'blue' : 'purple'}-600 text-white px-4 py-2 rounded-lg`}
            onClick={handleClick}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Task;
