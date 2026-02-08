import styles from "./App.module.css";
import { useEffect } from "react";
import { testFirebaseConnection } from "./firebase/config";

function App() {
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <div>
      <h1>Super Bowl Squares</h1>
      <p>Check console for Firebase connection status</p>
    </div>
  );
}

export default App;
