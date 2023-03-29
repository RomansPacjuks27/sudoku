import * as React from 'react';
import { utils } from './Utils';
import { ButtonPanel } from './Controls';
import { solver } from './Solver';
import { ModalComponent } from './bootstrap-components/Modal';

export const GameField = () => {
    const [cellState, setCellState] = React.useState(0);
    const [cellValues, setCellValues] = React.useState(utils.BLANK_BOARD);
    const [showSolved, setShowSolved] = React.useState(false);
    const [candidatesOn, setCandidatesOn] = React.useState(false);
    const [candidateTabActive, setCandidateTabActive] = React.useState(false);
    const [candidateValues, setCandidateValues] = React.useState(utils.BLANK_CANDIDATE_BOARD);

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
    }, [candidateTabActive]);

    const checkIfBoardIsFilled = () => {
      if(cellValues.length == 81 && cellValues.every((x, idx) => cellValues[idx] != 0 && solver.acceptable(cellValues, idx, x))) {
        setShowSolved(true);
      }
    }

    const onSolvedClicked = (result) => {
      setShowSolved(false);
      if(result) {
        setInitialValues();
      }
    }

    const assignCandidates = (number) => {
      setCandidateValues(prev => {
        const candidateBox = number == -1 ? Array(9).fill(false) :
          [
            ...prev[cellStateRef.current].slice(0, number-1),
            !prev[cellStateRef.current][number-1],
            ...prev[cellStateRef.current].slice(number, 9)
          ];
        return [
          ...prev.slice(0, cellStateRef.current),
          candidateBox,
          ...prev.slice(cellStateRef.current + 1, 81)
        ]});
    }

    const assignCells = (number) => {
      setCellValues(prev => {
        return [
          ...prev.slice(0, cellStateRef.current),
          number,
          ...prev.slice(cellStateRef.current + 1, 81)
        ];
      })
    }

    const keyboardEventListener = event => {
      if (utils.isPlayingNumber(event.key)) {
        if (candidateTabActive) {
          setCandidateInCell(event.key);
        }
        else {
          setNumberInCell(event.key);
        }
      }
      else if (event?.code == "Backspace" || event?.code == "Delete") {
        assignCells(0);
        assignCandidates(-1);
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

    const setCandidateInCell = (number) => {
      if(!predefinedCells.current[cellStateRef.current])
      {
        if(!candidatesOn)
          enableCandidateMode(true);
        assignCells(0);
        assignCandidates(number);
      }
    }

    const setNumberInCell = (number) => {
      if(!predefinedCells.current[cellStateRef.current])
      {
          if(candidatesOn)
            enableCandidateMode(false);
          assignCandidates(-1);
          assignCells(solver.d2b(number));
      }
    }

    const getCandidateCellValue = (key, num) => {
      return candidateValues && candidateValues[key] && candidateValues[key][num] && candidateValues[key][num] ? (num + 1) : "";
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

    const enableCandidateMode = (candidates) => {
      setCandidatesOn(candidates);
    }
  
    const setInitialValues = () => {
      let [startingBoard, solvedBoard] = solver.newStartingBoard();
      predefinedCells.current = startingBoard;
      setCandidateValues(utils.BLANK_CANDIDATE_BOARD);
      setCellValues(startingBoard);
    }

    const resetGameBoard = () => {
      if(predefinedCells) {
        setCandidateValues(utils.BLANK_CANDIDATE_BOARD);
        setCellValues(predefinedCells.current);
      }
    }
  
    return (
      <div className="gameLayout">
        <div className="leftPanel"></div>
        <div className="gameField">
          <ModalComponent 
            showModal={showSolved} 
            onButtonClick={onSolvedClicked} 
            title="Congratulations!" 
            text="You solved the puzzle!" 
            button1text="Start new Game" 
            button2text="Later">
          </ModalComponent>
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
                            if (candidateValues[cellKey].some(x => x)) {
                              return (
                                <div onClick={() => handleClick(cellKey)} key={cellKey} className={`candidateBox` + setCellStatus(cellKey)}>
                                  {utils.range(0, 8).map(x => 
                                    <CandidateCell cellValue={getCandidateCellValue(cellKey, x)} cellStatus={setCellStatus(cellKey)} number={cellKey} key={cellKey + `-` + x} />
                                  )}
                                </div>
                              )
                            }
                            else {
                              return <Cell onClick={handleClick} cellValue={getCellValue(cellKey)} cellStatus={setCellStatus(cellKey)} number={cellKey} key={cellKey} />
                            }
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
          <ButtonPanel key="ButtonPanel" newGame={setInitialValues} resetGame={resetGameBoard} onCandidateClick={setCandidateInCell} onNumberClick={setNumberInCell} candidateTabActive={(active) => setCandidateTabActive(active)} />
        </div>
      </div>
    )
  }

const Cell = props => {
    return <input value={props.cellValue}  type="button" onClick={() => props.onClick(props.number)} className={`cell` + props.cellStatus}></input>
};

const CandidateCell = props => {
  return <input value={props.cellValue}  type="button" className={`candidateCell` + props.cellStatus}></input>
};