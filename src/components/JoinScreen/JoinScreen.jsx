import { useState } from "react";
import { signInAnonymously, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import styles from "./JoinScreen.module.css";

export default function JoinScreen() {
  const [playerName, setPlayerName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    setError(null);

    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(auth);

      // Set display name
      await updateProfile(userCredential.user, {
        displayName: playerName.trim(),
      });

      // Add to Firestore players array
      const gameRef = doc(db, "games", "superbowl2025");
      await setDoc(
        gameRef,
        {
          players: arrayUnion(playerName.trim()),
          gamePhase: "joining",
        },
        { merge: true },
      );

      console.log("✅ Joined successfully!", userCredential.user);
    } catch (error) {
      console.error("❌ Error joining:", err);
      setError(err.message);
      setIsJoining(false);
    }
  };

  return (
    <section className={styles.joinScreen}>
      <h1>Join Super Bowl Squares</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="playerName">Name: </label>
        <input
          type="text"
          name="playerName"
          id="playerName"
          value={playerName}
          onChange={handlePlayerNameChange}
          disabled={isJoining}
        />

        <button type="submit" disabled={!playerName.trim() || isJoining}>
          {isJoining ? "Joining..." : "Join the Fun!"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </section>
  );
}
