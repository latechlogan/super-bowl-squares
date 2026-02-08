import styles from "./App.module.css";
import { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useGameState } from "./hooks/useGameState";
import JoinScreen from "./components/JoinScreen/JoinScreen.jsx";
import AdminPanel from "./components/AdminPanel/AdminPanel.jsx";
import Board from "./components/Board/Board.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const { gameState, loading: gameLoading, error } = useGameState();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setShowAdmin(true);
    }
  }, []);

  if (authLoading || gameLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (showAdmin) {
    return <AdminPanel />;
  }

  const gamePhase = gameState?.gamePhase;
  const isDraftingOrFinished = gamePhase === "drafting" || gamePhase === "finished";

  return (
    <div>
      {!user ? (
        <JoinScreen />
      ) : isDraftingOrFinished ? (
        <Board />
      ) : (
        <div>
          <h2>Welcome, {user.displayName}!</h2>
          <p>Game Phase: {gamePhase || "Not started"}</p>

          <h3>Players ({gameState?.players?.length || 0}):</h3>
          <ul>
            {gameState?.players?.map((player) => {
              return <li key={player}>{player}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
