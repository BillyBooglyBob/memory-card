import { useState } from "react";
import "./App.css";
import Home from "./components/Home";
import Game from "./components/Game";

function App() {
    const [screenDisplay, setScreenDisplay] = useState("home");
    const [difficulty, setDifficulty] = useState("easy");

    const handleScreenDisplay = (screen) => {
        setScreenDisplay(screen);
    };

    const handleDifficulty = (difficulty) => {
        setDifficulty(difficulty);
    };

    return (
        <div className="container">
            {screenDisplay === "home" ? (
                <Home changeScreen={handleScreenDisplay} changeDifficulty={handleDifficulty} />
            ) : (
                <Game changeScreen={handleScreenDisplay} difficulty={difficulty} changeDifficulty={handleDifficulty}/>
            )}
        </div>
    );
}

export default App;
