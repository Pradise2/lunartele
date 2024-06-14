import React from 'react'
import Footer from '../Others/Footer'

const Squad = () => {
  return (
    <div class=" bg-zinc-900 text-white flex flex-col items-center p-0">
    <h1 class="text-center text-2xl font-bold mb-6">
      The bigger the tribe, the better the vibe!
    </h1>
    <div class="w-full max-w-md bg-zinc-800 rounded-lg p-4 mb-4">
      <p class="text-center text-zinc-400">Total squad balance</p>
      <p class="text-center text-3xl font-bold">
        22’569.31 <span class="text-purple-400">Lunar</span>
      </p>
    </div>
    <div class="w-full max-w-md bg-zinc-800 rounded-lg p-4 mb-4">
      <p class="text-center text-zinc-400">Your rewards</p>
      <p class="text-center text-3xl font-bold">
        0.00 <span class="text-purple-400">Lunar</span>
      </p>
      <p class="text-center text-zinc-400 mb-4">10% of your friends earnings</p>
      <button class="w-full bg-zinc-700 text-zinc-500 py-2 rounded-lg">Claim</button>
    </div>
    <div class="w-full max-w-md bg-zinc-800 rounded-lg p-4 mb-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <img
          undefinedhidden="true"
          alt="team"
          src="https://placehold.co/24x24"
          class="w-6 h-6"
        />
        <p>Your team</p>
      </div>
      <p>0 users</p>
    </div>
    <div class="w-full max-w-md flex space-x-2">
      <button class="flex-1 bg-purple-500 py-2 rounded-lg">Invite friends</button>
      <button class="bg-zinc-700 p-2 rounded-lg">
        <img undefinedhidden="true" alt="share" src="https://placehold.co/24x24" />
      </button>
    </div>
    <Footer/>
  </div>
  )
}

export default Squad