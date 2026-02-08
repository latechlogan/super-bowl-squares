import { useState } from "react";
import styles from "./JoinScreen.module.css";

export default function JoinScreen() {
  const [playerName, setPlayerName] = useState("");

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Firebase auth and Firestore logic will go here
    console.log("Joining with name:", playerName);
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
        />

        <button type="submit" disabled={!playerName.trim()}>
          Join the Fun!
        </button>
      </form>
    </section>
  );
}
