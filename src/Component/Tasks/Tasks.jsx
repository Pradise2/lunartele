import React, { useState } from 'react';
import Header from '../Others/Header';
import Task from '../Others/Task';
import Footer from '../Others/Footer';


function Tasks() {
  const [total, setTotal] = useState(10000);
  const [taskCompleted, setTaskCompleted] = useState(false);

  const handleClaim = (points) => {
    if (!taskCompleted) {
      setTotal(total + points);
      setTaskCompleted(true);
    }
  };

  return (
    <div className="max-h-screen p-2 bg-zinc-900 text-white p-0 ">
      <Header total={total} />
      <div className="space-y-4">
        <Task title="lunar " points={10000} onClaim={handleClaim} />
        <div id="T8" className="bg-zinc-800 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Invite 1 Friend</h2>
            <p id="T5" className="text-purple-400">🪙 5'000 lunar</p>
          </div>
          <button id="T1" className="bg-purple-600 text-white px-4 py-2 rounded-lg">Start</button>
        </div>
        
          <div class="bg-zinc-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 class="font-semibold">Invite 5 Friends</h2>
              <p class="text-purple-400">🪙 15'000 lunar</p>
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded-lg">Start</button>
          </div>
      
          
          <div class="bg-zinc-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 class="font-semibold">Invite 10 Friends</h2>
              <p class="text-purple-400">🪙 25'000 lunar</p>
            </div>
            <button class="bg-purple-600 text-white px-4 py-2 rounded-lg">Start</button>
          </div>
      </div>
      <Footer />
    </div>
  );
}

export default Tasks;
