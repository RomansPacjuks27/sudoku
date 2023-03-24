import * as React from 'react';
import { utils } from './Utils';
import { ButtonPanel } from './Controls';
import { solver } from './Solver';

export const GameField = () => {
    const [cellState, setCellState] = React.useState(0);
    const [cellValues, setCellValues] = React.useState(utils.BLANK_BOARD);
    const predefinedCells = React.useRef([]); 
    const cellStateRef = React.useRef(cellState);
    const setCurrentCell = data => {
      cellStateRef.current = data;
      setCellState(data);
    };

    React.useEffect(() => {
      checkIfBoardIsFilled();
    }, [cellValues]);
  
    React.useEffect(() =>
    {
      window.addEventListener('keydown', keyboardEventListener);
      return () =>
        {
          window.removeEventListener('keydown', keyboardEventListener);
        }
    }, []);

    const checkIfBoardIsFilled = () => {
      if(cellValues.every((x, idx) => cellValues[idx] && solver.acceptable(cellValues, idx, x))) {
        setTimeout(() => alert('Solved!'), 100);
      }
    }

    const keyboardEventListener = event => {
        if (!predefinedCells.current[cellStateRef.current])
        {
          if (utils.isPlayingNumber(event.key)) {
            setCellValues((prev) => {
              return [
                ...prev.slice(0, cellStateRef.current),
                solver.d2b(event.key),
                ...prev.slice(cellStateRef.current + 1, 81)
              ];
            })
          }
          else if (event?.code == "Backspace" || event?.code == "Delete") {
            setCellValues((prev) => {
              return [
                ...prev.slice(0, cellStateRef.current),
                0,
                ...prev.slice(cellStateRef.current + 1, 81)
              ];
            })
          }
        }

        if (event.code == 'ArrowRight' && ((cellStateRef.current+1) % 9 > 0 || cellStateRef.current < 8)) {
          setCurrentCell(cellStateRef.current + 1);
        }
        else if (event?.code == 'ArrowLeft' && cellStateRef.current % 9 > 0) {
          setCurrentCell(cellStateRef.current - 1);
        }
        else if (event?.code == 'ArrowDown' && cellStateRef.current < 72) {
          setCurrentCell(cellStateRef.current + 9);
        }
        else if (event?.code == 'ArrowUp' && cellStateRef.current > 8) {
          setCurrentCell(cellStateRef.current - 9);
        }

        event.stopPropagation();
      }
  
    const getKey = (x, y, row, col) => {
      let id =  9 * (3*(y-1) + row-1) + 3*(x-1) + col-1;  
      return id; 
    }
    
    const handleClick = (key) => {
      setCurrentCell(key);
    }

    const setNumberInCell = (number) => {
      if(!predefinedCells.current[cellStateRef.current])
      {
        setCellValues((prev) => {
          return [
            ...prev.slice(0, cellStateRef.current),
            solver.d2b(number),
            ...prev.slice(cellStateRef.current + 1, 81)
          ];
        });
      }
    }
  
    const getCellValue = (key) => {
      return (cellValues && cellValues[key]) ? solver.b2d(cellValues[key]) : "";
    }
  
    const setCellStatus = (key) => {
      if (key == cellState) 
        return "active";
      else if (predefinedCells.current[key])
        return "predefined";
      else
        return "";
    }
  
    const setInitialValues = () => {
      let [startingBoard, solvedBoard] = solver.newStartingBoard();
      predefinedCells.current = startingBoard;
      setCellValues(startingBoard);
    }

    const resetGameBoard = () => {
      setCellValues(predefinedCells.current);
    }
  
    return (
      <div className="gameLayout">
        <div className="leftPanel"></div>
        <div className="gameField">
          <div key="box" className="box">
            <div key="box-shell" className="box-shell">
              {utils.range(1, 3).map(x =>
                <div key={'row-block' + x} className="row-block"> 
                  {utils.range(1, 3).map(y => 
                    <div key={'nine-block' + y} className="nine-block">
                      {utils.range(1, 3).map(col => 
                        <div key={'col' + col} className="col">
                          {utils.range(1, 3).map(row => {
                              const cellKey = getKey(x, y, row, col);
                              return <Cell onClick={handleClick} cellValue={getCellValue(cellKey)} cellStatus={setCellStatus(cellKey)} number={cellKey} key={cellKey} />
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <ButtonPanel key="ButtonPanel" newGame={setInitialValues} resetGame={resetGameBoard} onNumberClick={setNumberInCell}/>
        </div>
      </div>
    )
  }

const Cell = props => {
    return <input value={props.cellValue}  type="button" onClick={() => props.onClick(props.number)} className={`cell` + props.cellStatus}></input>
};