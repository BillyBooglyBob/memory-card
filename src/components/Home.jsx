import { useState } from "react";
import "../css/Home.css";

export default function Home({ changeScreen, changeDifficulty }) {
    const [selectedItem, setSelectedItem] = useState(0);

    const handleClick = (value) => {
        setSelectedItem(value);
        changeDifficulty(value);
    };

    return (
        <>
            <h1>PocketMon Pair-Up: Gotta Match 'Em All!</h1>

            <form>
                <label className="selected" onClick={() => handleClick("easy")}>
                    <input type="radio" name="difficulty" defaultChecked />
                    <span>Easy</span>
                </label>
                <label className="selected" onClick={() => handleClick("medium")}>
                    <input type="radio" name="difficulty" />
                    <span>Medium</span>
                </label>
                <label className="selected" onClick={() => handleClick("hard")}>
                    <input type="radio" name="difficulty" />
                    <span>Hard</span>
                </label>
            </form>

            <h2 onClick={() => changeScreen("game")}>Start game</h2>
        </>
    );
}
