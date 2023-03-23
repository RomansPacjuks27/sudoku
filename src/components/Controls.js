import * as React from 'react';
import { utils, colors } from './Utils';

export const ButtonPanel = props => {
  
    return (
      <div className="buttonPanel">
        <div className="numberButtons">
          { utils.range(1, 9).map(y => 
            <ButtonNumber onClick={props.onNumberClick} key={y} number={y} />
          )}
        </div>
        <div className="mainButtons">
          <button className="mainButton" onClick={props.newGame}>New Game</button>
          <button className="mainButton" onClick={props.resetGame}>Reset</button>
        </div>
      </div>
    )
  };
  
  const ButtonNumber = (props) => {
    return (
      <button 
        className="numberButton"
        onClick={() => props.onClick(props.number)}>
        {props.number}
      </button>
    )
  };
