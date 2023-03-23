import * as React from 'react';
import { GameField } from './GameField';

const Game = () => {
  return (
    <div key="Game" className="game">
      <GameField key="GameField"/>
    </div>
  )
};

export {Game as App};