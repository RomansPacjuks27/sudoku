import * as React from 'react';
import { utils } from './Utils';

export const ButtonPanel = props => {
    const [active, setActive] = React.useState("normal");
    const isActive = (button) => {
      if(active == button) {
        return "selected"
      }
      return "";
    }

    return (
      <div className="buttonPanel">
        <div className="switchModeButtons">
          <div className="modeButtons">
            <button onClick={() => { setActive("normal"); props.candidateTabActive(false); }} className={`modeButton left btn btn-primary ` + isActive("normal")}>
              Normal
            </button>
            <button onClick={() => { setActive("candidate"); props.candidateTabActive(true); }} className={`modeButton right btn btn-primary ` + isActive("candidate")} >
              Candidates
            </button>
          </div>

        </div>
        <div className={active == "normal" ? `numberButtons` : `candidateButtons`}>
          { utils.range(1, 9).map(y => 
            <ButtonNumber onClick={active == "normal" ? props.onNumberClick : props.onCandidateClick} key={y} number={y} mode={active} />
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

    const getColumn = (num) => {
      return 'numcol-' + (num-1) % 3;
    }

    const getRow = (num) => {
      return 'numrow-' + Math.floor((num-1) / 3);
    }

    return (
        <button 
          className={props.mode == "normal" ? `numberButton` : `candidateButton`}
          onClick={() => props.onClick(props.number)}>
          { props.mode == "normal" ? props.number : 
            <div className={getColumn(props.number) + ` ` + getRow(props.number)}>
              {props.number}
            </div>
          }
        </button>
    )
  };
