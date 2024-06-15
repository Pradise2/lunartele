import React from 'react'
import { useSearchParams } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp } from '../../firebaseConfig';
import Footer from '../Others/Footer'

const Boost = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const userId = searchParams.get('userId');
    
    if (userId) {
      console.log(`User ID from URL: ${userId}`);
      // Log user ID to Firestore
      addDoc(collection(db, 'userClicks'), {
        userId: userId,
        timestamp: serverTimestamp()
      })
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
    }
  }, [searchParams]);
  return (
    <>
    <body class="bg-gray-900 flex items-center justify-center min-h-screen text-white">
  <div class="text-center">
    <h1 class="text-5xl font-bold mb-4">Coming Soon</h1>
    <p class="text-lg">We're working hard to finish the development of this site. Stay tuned!</p>
  </div>
  
</body>
<Footer/>
</>
  )
}

export default Boost