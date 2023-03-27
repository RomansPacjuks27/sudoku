import * as React from 'react';
import { utils } from './Utils';
import Button from 'react-bootstrap/Button';

export const ButtonPanel = props => {
  
    return (
      <div className="buttonPanel">
        <div className="numberButtons">
          { utils.range(1, 9).map(y => 
            <ButtonNumber onClick={props.onNumberClick} key={y} number={y} />
          )}
        </div>
        <div className="mainButtons">
          <button type="button" className="mainButton btn btn-outline-primary">Hint</button>
          <button type="button" className="mainButton btn btn-outline-primary" onClick={props.resetGame}>Reset</button>
          <button type="button" className="longButton btn btn-primary" onClick={props.newGame}>New Game</button>
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
