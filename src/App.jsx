import styles from "./App.module.css";
import { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import JoinScreen from "./components/JoinScreen";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <section>
      {!user ? (
        <JoinScreen />
      ) : (
        <div>
          <h2>Welcome, {user.displayName}!</h2>
          <p>Waiting for game to start...</p>
          <p>
            <small>User ID: {user.uid}</small>
          </p>
        </div>
      )}
    </section>
  );
}

export default App;
