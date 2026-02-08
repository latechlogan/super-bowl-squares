import styles from "./App.module.css";
import { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useGameState } from "./hooks/useGameState";
import JoinScreen from "./components/JoinScreen/JoinScreen.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { gameState, loading: gameLoading, error } = useGameState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  });

  if (authLoading || gameLoading) return <div>Loading...</div>;

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section>
      {!user ? (
        <JoinScreen />
      ) : (
        <div>
          <h2>Welcome, {user.displayName}!</h2>
          <p>Game Phase: {gameState?.gamePhase || "Not started"}</p>

          <h3>Players ({gameState?.players?.length || 0}):</h3>
          <ul>
            {gameState?.players?.map((player) => {
              <li key={player}>{player}</li>;
            })}
          </ul>

          <h3>Debug Info:</h3>
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}

export default App;
