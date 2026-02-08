import styles from "./Board.module.css";
import { useGameState } from "../../hooks/useGameState";
import { Fragment, useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function Board() {
  const { gameState, loading, error } = useGameState();
  const [currentUser, setCurrentUser] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Loading board...</div>;
  if (error) return <div>Error: {error}</div>;

  const homeName = gameState?.teamNames?.home || "Home";
  const awayName = gameState?.teamNames?.away || "Away";
  const currentPlayerName = currentUser?.displayName;
  const isDrafting = gameState?.gamePhase === "drafting";
  const isFinished = gameState?.gamePhase === "finished";
  const draftOrder = gameState?.draftOrder || [];
  const totalPlayers = draftOrder.length;
  const currentDrafter = isDrafting ? draftOrder[gameState.currentTurnIndex] : null;
  const isMyTurn = isDrafting && currentPlayerName && currentDrafter === currentPlayerName;

  const handleSquareClick = async (row, col) => {
    if (!isDrafting || isClaiming) return;

    const squareKey = `${row}-${col}`;
    const owner = gameState?.squares?.[squareKey];

    if (owner) return;

    if (!isMyTurn) {
      alert("It's not your turn!");
      return;
    }

    setIsClaiming(true);
    try {
      const gameRef = doc(db, "games", "superbowl2025");

      // Claim the square
      await updateDoc(gameRef, {
        [`squares.${squareKey}`]: currentPlayerName,
      });

      // Count filled squares (including this new one)
      const filledSquares =
        Object.values(gameState.squares || {}).filter((v) => v !== null).length + 1;

      // Check if draft is complete
      if (filledSquares >= 100) {
        await updateDoc(gameRef, { gamePhase: "finished" });
      } else {
        // Snake draft: calculate next turn
        const currentIndex = gameState.currentTurnIndex;
        const round = Math.floor((filledSquares - 1) / totalPlayers);
        const pickInRound = (filledSquares - 1) % totalPlayers;
        const isLastPick = pickInRound === totalPlayers - 1;
        let nextIndex;

        if (isLastPick) {
          // Last pick of the round: same player goes first next round
          nextIndex = currentIndex;
        } else if (round % 2 === 0) {
          // Even round: advance forward
          nextIndex = (currentIndex + 1) % totalPlayers;
        } else {
          // Odd round: advance backward
          nextIndex =
            currentIndex === 0 ? totalPlayers - 1 : currentIndex - 1;
        }

        await updateDoc(gameRef, { currentTurnIndex: nextIndex });
      }
    } catch (err) {
      console.error("Error claiming square:", err);
      alert("Failed to claim square. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={styles.boardContainer}>
      {/* Turn indicator */}
      {isDrafting && isMyTurn && (
        <div className={`${styles.turnBanner} ${styles.myTurnBanner}`}>
          Your turn! Pick a square.
        </div>
      )}
      {isDrafting && !isMyTurn && currentDrafter && (
        <div className={styles.turnBanner}>
          Waiting for <strong>{currentDrafter}</strong> to pick...
        </div>
      )}
      {isFinished && (
        <div className={`${styles.turnBanner} ${styles.finishedBanner}`}>
          Draft Complete! All squares claimed.
        </div>
      )}

      <div className={`${styles.grid} ${isClaiming ? styles.gridDisabled : ""}`}>
        {/* Row 1: two empty corners + home team name */}
        <div className={styles.corner} />
        <div className={styles.corner} />
        <div className={styles.homeTeamName}>{homeName}</div>

        {/* Row 2: two empty corners + column numbers */}
        <div className={styles.corner} />
        <div className={styles.corner} />
        {digits.map((col) => (
          <div key={`col-${col}`} className={styles.columnNumber}>
            {col}
          </div>
        ))}

        {/* Away team name spanning all 10 board rows */}
        <div className={styles.awayTeamName}>{awayName}</div>

        {/* Board rows */}
        {digits.map((row) => (
          <Fragment key={`row-${row}`}>
            <div className={styles.rowNumber}>{row}</div>
            {digits.map((col) => {
              const key = `${row}-${col}`;
              const owner = gameState?.squares?.[key] || null;
              const isCurrentUserSquare =
                owner && currentPlayerName && owner === currentPlayerName;
              const isEmpty = !owner;
              const isClickable = isDrafting && isEmpty && isMyTurn && !isClaiming;

              let squareClass = styles.square;
              if (isCurrentUserSquare) {
                squareClass += ` ${styles.squareMine}`;
              } else if (owner) {
                squareClass += ` ${styles.squareClaimed}`;
              } else if (isDrafting && isMyTurn) {
                squareClass += ` ${styles.squareAvailable}`;
              }
              if (isClickable) {
                squareClass += ` ${styles.squareClickable}`;
              }

              return (
                <div
                  key={key}
                  className={squareClass}
                  onClick={() => handleSquareClick(row, col)}
                >
                  {owner && <span className={styles.ownerName}>{owner}</span>}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
