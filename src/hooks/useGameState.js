import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const gameRef = doc(db, "games", "superbowl2025");

    const unsubscribe = onSnapshot(
      gameRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setGameState({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          });
          setLoading(false);
        } else {
          setGameState(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to game state:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  });

  return { gameState, loading, error };
}
