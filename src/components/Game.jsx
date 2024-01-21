import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import "../css/Game.css";
import IMAGES from "../assets/images/Images";

export default function Game({ changeScreen, difficulty }) {
    const [highScore, setHighScore] = useState(0);
    const [cards, setCards] = useState([]);
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [gameStatus, setGameStatus] = useState("selecting");
    const [score, setScore] = useState(0);

    const initiateCards = () => {
        const fetchPokemonData = async (pokemonData) => {
            const response = await fetch(pokemonData.url);
            const data = await response.json();
            const image = await data.sprites.versions["generation-v"]["black-white"].front_default;
            const name = await data.name;

            const pokemon = {
                id: uuid(),
                name: name,
                image: image,
            };

            setCards((prevData) => [...prevData, pokemon]);
        };

        const getRandomItems = (array, count) => {
            const shuffledArray = array.sort(() => Math.random() - 0.5);
            return shuffledArray.slice(0, count);
        };

        const randomSelect = (pokemonsArray) => {
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
            const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=300");
            const data = await response.json();
            const result = await data.results;
            const selectPokemons = randomSelect(result);

            selectPokemons.forEach((pokemon) => {
                fetchPokemonData(pokemon);
            });
        };
        fetchPokemons();
    };

    // used to prevent useEffect hook being called twice in development due to strict mode
    const initialised = useRef(false);

    useEffect(() => {
        if (!initialised.current) {
            initialised.current = true;
            initiateCards();
        }
    }, []);

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

    const updateScore = () => {
        const newScore = score + 1;
        setScore(newScore);

        // update the high score as well
        if (newScore > highScore) {
            setHighScore(newScore);
        }
    };

    const shuffle = () => {
        let array = cards;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        setCards(array);
    };

    const select = (id) => {
        selectCard(id);
        shuffle();
    };

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

    const quit = () => {
        changeScreen("home");
    };

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
