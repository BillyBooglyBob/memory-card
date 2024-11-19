import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import "../css/Game.css";
import IMAGES from "../assets/images/Images";
import { motion } from "framer-motion";

export default function Game({ changeScreen, difficulty, changeDifficulty }) {
    const [cards, setCards] = useState([]);
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [gameStatus, setGameStatus] = useState("selecting");
    const [highScore, setHighScore] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [flipped, setFlipped] = useState(false); // New state for flipping animation

    const initiateCards = () => {
        // Randomly select pokemons
        const randomSelect = (pokemonsArray) => {
            const getRandomItems = (array, count) => {
                const shuffledArray = array.sort(() => Math.random() - 0.5);
                return shuffledArray.slice(0, count);
            };

            let pokemonCount = 0;
            if (difficulty === "easy") pokemonCount = 5;
            else if (difficulty === "medium") pokemonCount = 10;
            else if (difficulty === "hard") pokemonCount = 20;

            return getRandomItems(pokemonsArray, pokemonCount);
        };

        // Fetch pokemons from API
        const fetchPokemons = async () => {
            setLoading(true);
            const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=300");
            const data = await response.json();
            const result = await data.results;

            const selectPokemons = randomSelect(result);

            const pokemonPromises = selectPokemons.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                const data = await response.json();
                const image = data.sprites.versions["generation-v"]["black-white"].front_default;

                return {
                    id: uuid(),
                    name: data.name,
                    image,
                };
            });

            const pokemons = await Promise.all(pokemonPromises);
            setCards(pokemons);
            setLoading(false);
        };
        fetchPokemons();
    };

    // When the component mounts, initiate the cards
    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            initiateCards();
        }
    }, []);

    // Shuffle the cards
    const shuffle = () => {
        const array = [...cards];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        setCards(array);
    };

    // Check if selected card is in the selectedCardIds array
    const selectCard = (id) => {
        if (selectedCardIds.includes(id)) setGameStatus("lose");

        setSelectedCardIds([...selectedCardIds, id]);
        updateScore();

        if (selectedCardIds.length + 1 === cards.length) setGameStatus("win");
    };

    // When card selected, check for win. If loss or win, end the game.
    // Else, shuffle
    const select = (id) => {
        selectCard(id); // Process selected card

        // Shuffle is resetting the flips
        if (!flipped) {
            setFlipped(true); // Start flipping animation

            // Set two different timeouts as there is a delay between shuffle
            // and updating the cards array. If shuffle is at the same time as
            // flipping the cards back, some cards will not have the animation.

            // Shuffle the cards first
            setTimeout(() => {
                shuffle();
            }, 500);

            // Wait for 0.5s to make sure the shuffled cards have updated the
            // cards array before flipping the cards, else shuffle might
            // have conflict and some cards will not have the animation
            setTimeout(() => {
                setFlipped(false);
            }, 1000);
        }
    };

    // Update user score
    const updateScore = () => {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > highScore) setHighScore(newScore);
    };

    // Play again
    const playAgain = () => {
        initiateCards(); // Get new set of cards
        setScore(0); // Reset score
        setSelectedCardIds([]); // Reset selected cards
        setGameStatus("selecting");
    };

    // Quit the game and reset difficulty
    const quit = () => {
        changeDifficulty("easy");
        changeScreen("home");
    };

    if (loading) {
        return <div className="poke-ball"></div>;
    }

    return (
        <>
            {gameStatus === "selecting" ? (
                <>
                    <div className="home-button" onClick={quit}>
                        <div>
                            <img src={IMAGES.logo} />
                            <h1>PocketMon Pair-Up: Gotta Match 'Em All!</h1>
                        </div>
                    </div>

                    <div className="score-board">
                        <h2>High Score: {highScore}</h2>
                        <h2>Score: {score}</h2>
                    </div>
                    <div className="cards">
                        {cards.map((card) => (
                            // Two divs overlayed on top of each other. One for front and one for back
                            // Initially, front is displayed. When flipped is applied, will rotate
                            // to show the back. After removing flipped, it will rotate back
                            // to the front
                            <div key={card.id} onClick={() => select(card.id)} className="card">
                                <div className={flipped ? "flipped" : ""}>
                                    <div className="front">
                                        <img src={card.image} alt={card.name} />
                                        <h1>{card.name}</h1>
                                    </div>
                                    <div className="back">
                                        <img src={IMAGES.pokemonCard} alt="card back" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : gameStatus === "lose" ? (
                <>
                    <div>lose</div>
                    <button onClick={playAgain}>Play Again</button>
                    <button onClick={quit}>Quit</button>
                </>
            ) : (
                <>
                    <div>win</div>
                    <button onClick={playAgain}>Play Again</button>
                    <button onClick={quit}>Quit</button>
                </>
            )}
        </>
    );
}
