import styles from "./AdminPanel.module.css";
import { useGameState } from "../../hooks/useGameState";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminPanel() {
  const { gameState, loading, error } = useGameState();
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (gameState?.teamNames) {
      setHomeTeam(gameState.teamNames.home || "");
      setAwayTeam(gameState.teamNames.away || "");
    }
  }, [gameState]);

  const handleSaveTeamNames = async () => {
    setIsSaving(true);
    try {
      const gameRef = doc(db, "games", "superbowl2025");
      await updateDoc(gameRef, {
        "teamNames.home": homeTeam,
        "teamNames.away": awayTeam,
      });
      console.log("✅ Team names saved!");
    } catch (error) {
      console.error("❌ Error saving team names:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRandomizeDraftOrder = async () => {
    if (!gameState?.players || gameState.players.length === 0) {
      alert("No players to randomize!");
      return;
    }

    try {
      // Shuffle the players array
      const shuffled = [...gameState.players].sort(() => Math.random() - 0.5);

      const gameRef = doc(db, "games", "superbowl2025");
      await updateDoc(gameRef, {
        draftOrder: shuffled,
      });

      console.log("✅ Draft order randomized!");
    } catch (err) {
      console.error("❌ Error randomizing order:", err);
    }
  };

  const handleStartDraft = async () => {
    if (!gameState?.draftOrder || gameState.draftOrder.length === 0) {
      alert("Set the draft order first!");
      return;
    }

    if (!confirm("Start the draft? Players can no longer join.")) {
      return;
    }

    try {
      const gameRef = doc(db, "games", "superbowl2025");
      await updateDoc(gameRef, {
        gamePhase: "drafting",
        currentTurnIndex: 0, // Start with first player
      });

      console.log("✅ Draft started!");
    } catch (err) {
      console.error("❌ Error starting draft:", err);
    }
  };

  if (loading) return <div>Loading admin panel...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.adminPanel}>
      <h1>🏈 Admin Control Panel</h1>

      {/* Team Names Section */}
      <section className={styles.section}>
        <h2>Team Names</h2>
        <div className={styles.formGroup}>
          <label htmlFor="homeTeam">Top Team (Home):</label>
          <input
            type="text"
            id="homeTeam"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            placeholder="Patriots"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="awayTeam">Side Team (Away):</label>
          <input
            type="text"
            id="awayTeam"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            placeholder="Seahawks"
          />
        </div>

        <button onClick={handleSaveTeamNames} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Team Names"}
        </button>
      </section>

      {/* Players & Draft Order Section */}
      <section className={styles.section}>
        <h2>Players ({gameState?.players?.length || 0})</h2>

        <div className={styles.playersList}>
          <h3>Joined Players:</h3>
          <ul>
            {gameState?.players?.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>

        <div className={styles.draftOrder}>
          <h3>Draft Order:</h3>
          {gameState?.draftOrder ? (
            <ol>
              {gameState.draftOrder.map((player) => (
                <li key={player}>{player}</li>
              ))}
            </ol>
          ) : (
            <p>Not set yet</p>
          )}
        </div>

        <button onClick={handleRandomizeDraftOrder}>
          🎲 Randomize Draft Order
        </button>
      </section>

      {/* Game Controls Section */}
      <section className={styles.section}>
        <h2>Game Controls</h2>

        <div className={styles.gameStatus}>
          <p>
            Current Phase:{" "}
            <strong>{gameState?.gamePhase || "Not started"}</strong>
          </p>
        </div>

        {gameState?.gamePhase === "joining" && (
          <button onClick={handleStartDraft} className={styles.primaryButton}>
            ▶️ Start Draft
          </button>
        )}

        {gameState?.gamePhase === "drafting" && <p>✅ Draft in progress!</p>}

        {gameState?.gamePhase === "finished" && <p>🏁 Game finished!</p>}
      </section>

      {/* More sections will go here */}

      <h2>Game Info</h2>
      <p>Phase: {gameState?.gamePhase || "Not started"}</p>
      <p>Players: {gameState?.players?.length || 0}</p>
    </div>
  );
}
