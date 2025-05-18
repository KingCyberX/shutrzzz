import {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth'; // Import auth properly

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(user => {
      console.log('got user: ', user);
      if (user) {
        setUser(user); // Update state with the user object
      } else {
        setUser(null); // If no user, set it to null
      }
    });

    // Cleanup the listener when the component is unmounted
    return unsub;
  }, []); // Only run once on component mount

  return {user}; // Return the user state
}
