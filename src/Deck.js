import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from './Card';
import './Deck.css';

const API_BASE_URL = 'https://deckofcardsapi.com/api/deck'

function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function getDeck() {
      let deckData = await axios.get(`${API_BASE_URL}/new/shuffle`);
      setDeck(deckData.data);
    }
    getDeck();
  }, [setDeck]);

  useEffect(() => {
    async function getCard() {
      let { deck_id } = deck;

      try {
        let drawResponse = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);

        if (drawResponse.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error("No cards remaining");
        }

        const card = drawResponse.data.cards[0];

        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: card.value + " of " + card.suit,
            image: card.image
          }
        ]);
      } catch (error) {
        alert(error);
      }
    }

    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
  }

  const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <button className="Deck-drawButton" onClick={toggleAutoDraw}>
          {autoDraw ? "Stop" : "Continue"} drawing for me
        </button>
      ) : null}
      <div className="Deck-cardArea">{cards}</div>
    </div>
  );
}

export default Deck;