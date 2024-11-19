import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import "../css/Game.css";
import IMAGES from "../assets/images/Images";

export default function Game({ changeScreen, difficulty }) {
    const [cards, setCards] = useState([]); // All cards
    const [selectedCardIds, setSelectedCardIds] = useState([]); // Cards that have been selected already before
    const [gameStatus, setGameStatus] = useState("selecting"); // Game status, can be selecting, win or lose
    const [highScore, setHighScore] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch the pokemon data and initiate the cards
    const initiateCards = () => {
        // Randomly select pokemons based on the difficulty level
        const randomSelect = (pokemonsArray) => {
            const getRandomItems = (array, count) => {
                const shuffledArray = array.sort(() => Math.random() - 0.5);
                return shuffledArray.slice(0, count);
            };

            let pokemonCount = 0;
            if (difficulty === "easy") {
                pokemonCount = 5;
            } else if (difficulty === "medium") {
                pokemonCount = 10;
            } else if (difficulty === "hard") {
                pokemonCount = 20;
            }

            return getRandomItems(pokemonsArray, pokemonCount);
        };

        const fetchPokemons = async () => {
            // Turn on loading
            setLoading(true);

            // Fetch pokemons from the API
            const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=300");
            const data = await response.json();
            const result = await data.results;

            // Randomly select number of them based on the difficulty level
            const selectPokemons = randomSelect(result);

            // For each pokemon, fetch their data, initiate the card and add
            // it to the cards array
            const pokemonPromises = selectPokemons.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                const data = await response.json();
                const image = await data.sprites.versions["generation-v"]["black-white"]
                    .front_default;
                const name = await data.name;

                return {
                    id: uuid(),
                    name: name,
                    image: image,
                };
            });

            // Wait for all the pokemon data to be fetched before turning off loading
            const pokemons = await Promise.all(pokemonPromises);
            setCards(pokemons);
            setLoading(false);
        };
        fetchPokemons();
    };

    // used to prevent useEffect hook being called twice in development due to strict mode
    const initialised = useRef(false);

    // Initialise the cards
    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            initiateCards();
        }
    }, []);

    // Select a card and check if it is selected. If selected, set the game
    // status to lose, if not, update the score and check if the game is won
    const selectCard = (id) => {
        if (selectedCardIds.includes(id)) {
            setGameStatus("lose");
        }

        setSelectedCardIds([...selectedCardIds, id]);
        updateScore();

        let newSelectedCardIdsLength = selectedCardIds.length + 1;

        if (cards.length === newSelectedCardIdsLength) {
            setGameStatus("win");
        }
    };

    // Update the score
    const updateScore = () => {
        const newScore = score + 1;
        setScore(newScore);

        // update the high score as well
        if (newScore > highScore) {
            setHighScore(newScore);
        }
    };

    // Shuffle the existing cards
    const shuffle = () => {
        let array = cards;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        setCards(array);
    };

    // Select a card and shuffle the cards
    const select = (id) => {
        selectCard(id);
        shuffle();
    };

    // Play current game again
    const playAgain = () => {
        const reset = () => {
            setScore(0);
            setCards([]);
            setSelectedCardIds([]);
        };
        initiateCards();
        reset();
        setGameStatus("selecting");
    };

    // Quit current game and go back to home screen
    const quit = () => {
        changeScreen("home");
    };

    if (loading) {
        return <div class="poke-ball"></div>;
    }

    return (
        <>
            {gameStatus === "selecting" ? (
                <>
                    <div className="home-button" onClick={() => changeScreen("home")}>
                        <img src={IMAGES.logo} />
                        <h1>PocketMon Pair-Up: Gotta Match 'Em All!</h1>
                    </div>
                    <div className="score-board">
                        <h2>High Score: {highScore}</h2>
                        <h2>Score: {score}</h2>
                    </div>
                    <div className="cards">
                        {cards.map((card) => {
                            return (
                                <div key={card.id} onClick={() => select(card.id)}>
                                    <img src={card.image} alt={card.name} />
                                    <h1>{card.name}</h1>
                                </div>
                            );
                        })}
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
