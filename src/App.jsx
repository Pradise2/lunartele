import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Tasks from './Component/Tasks/Tasks';
import Main from './Component/Home/Main';
import Squad from './Component/Squad/Squad';
import Boost from './Component/Boost/Boost';

const App = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center p-4">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/squad" element={<Squad />} />
        <Route path="/boost" element={<Boost />} />
      </Routes>
    </div>
  );
};

export default App;
