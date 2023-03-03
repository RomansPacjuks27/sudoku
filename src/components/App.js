
import * as React from 'react';

const Game = () => {
  return (
    <div key="Game" className="game">
      <GameField key="GameField"/>
      <ButtonPanel key="ButtonPanel"/>
    </div>
  )
}

const GameField = () => {
  const [cellState, setCellState] = React.useState(0);
  const [cellValues, setCellValues] = React.useState({});

  const getKey = (x, y, col, row) => {
    let id = 3*(y-1)+x; //solver.rc2i(x, y); 
    return id + '-' + col + row;
  }

  const handleClick = (key) => {
    setCellState(key);
  }

  const getCellValue = (key) => {
    return cellValues[key];
  }

  const handleInput = (newkey, event) => {
    if(utils.isPlayingNumber(event.key)){
      setCellValues(prevValues => ({
        ...prevValues, [newkey]: event.key
      }));
    }
    
    event.preventDefault();
    event.stopPropagation();
  }

  const isCellClicked = (key) => {
    return key == cellState ? 1 : 0;
  }

  return (
    <div key="box" className="box">
      <div key="box-shell" className="box-shell">
        {utils.range(1, 3).map(x =>
          <div key={'row-block' + x} className="row-block"> 
            {utils.range(1, 3).map(y => 
              <div key={'nine-block' + y} className="nine-block">
                {utils.range(1, 3).map(row => 
                  <div key={'row' + row} className="row">
                    {utils.range(1, 3).map(col => {
                        const cellKey = getKey(x, y, col, row);
                        return <Cell onKeyPress={handleInput} onClick={handleClick} cellValue={getCellValue(cellKey)} cellStatus={isCellClicked(cellKey)} number={cellKey} key={cellKey} />
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const Cell = props => {
  return <input value={props.cellValue}  style={{backgroundColor: props.cellStatus  > 0 ? 'lightblue' : 'white' }} type="button" onClick={() => props.onClick(props.number)} onKeyDown={(e) => props.onKeyPress(props.number, e)} className="cell"></input>
}

const ButtonPanel = () => {
  const [board, setBoard] = React.useState({});

  const randomizePuzzle = () => {
    solver.fillRandomCells();
  }

  const solvePuzzle = () => {

  }

  return (
    <div>
      <div className="buttonPanel">
        {/* {utils.range(1, 9).map(y => 
          <ButtonNumber onClick={onNumberClick} key={y} number={y} status={numberStatus(y)} />
        )} */}
          <button className="numberButton" onClick={randomizePuzzle}>New Game</button>
          <button className="numberButton" onClick={solvePuzzle}>Solve</button>
      </div>
    </div>
  )
}

const ButtonNumber = (props) => {
  return (
    <button 
      className="numberButton"
      style={{backgroundColor: colors[props.status] }}
      onClick={() => props.onClick(props.number)}>
      {props.number}
    </button>
  )
}

const solver = {

  // index -> { row, col }
  i2rc(index) {
    return { row: Math.floor(index / 9), col: index % 9 };
  },

  // { row, col } -> index
  rc2i(row, col) {
    return row * 9 + col;
  },

  d2b(digit) {
    return 1 << (digit - 1);
  },

  fillRandomCells() {
    //select random cell count for filling the grid
    //check what number is safe to put in each of these cells
    //if some cells run out of any possible safe numbers, start randomizing board again.
    //when filled, pass board to solve function to see if it does have solution,
    //if it doesn't start randomizing board again.
    //if it does, generate board to ui
    let board = new Array(81).fill(0);
    let filledCellCount = utils.random(14, 24);
    for(let i = 0; i < filledCellCount; i++) {
      let rndRow = utils.random(0, 8);
      let rndCol = utils.random(0, 8);
      let idx = this.rc2i(rndRow, rndCol);

      while (board[idx]) {
        rndRow = utils.random(0, 8);
        rndCol = utils.random(0, 8);
        idx = this.rc2i(rndRow, rndCol);
      }

      let rndNumber = utils.random(1, 9);
      while(!this.acceptable(board, idx, rndNumber)) {
        rndNumber = utils.random(1, 9);
      }

      board[idx] = rndNumber;
    }

    if(this.solve(board)) {
      //board.map(x => x.value ? d2b(parseInt(x.value, 10)) : 0);
    }
    else{
    }
    //for (let r = r1; r < r1 + 3; ++r) {
      //for (let c = c1; c < c1 + 3; ++c, ++ir, ic += 9) {

  },

  getMoves(board, index) {
    let { row, col } = this.i2rc(index);
    let r1 = 3 * (row / 3 | 0);
    let c1 = 3 * (col / 3 | 0);
    let moves = 0;
    for (let r = r1, i = 0; r < r1 + 3; r++) {
        for (let c = c1; c < c1 + 3; c++, i++) {
            moves |= board[this.rc2i(r, c)]
                | board[this.rc2i(row, i)]
                | board[this.rc2i(i, col)];
        }
    }
    return moves ^ 511;
  },

  unique(allowed, index, value) {
    let { row, col } = this.i2rc(index);
    let r1 = 3 * (row / 3 | 0);
    let c1 = 3 * (col / 3 | 0);
    let ir = 9 * row;
    let ic = col;
    let uniq_row = true, uniq_col = true, uniq_3x3 = true;
    for (let r = r1; r < r1 + 3; ++r) {
        for (let c = c1; c < c1 + 3; ++c, ++ir, ic += 9) {
            if (uniq_3x3) {
                let i = this.rc2i(r, c);
                if (i != index && allowed[i] & value) uniq_3x3 = false;
            }
            if (uniq_row) {
                if (ir != index && allowed[ir] & value) uniq_row = false;
            }
            if (uniq_col) {
                if (ic != index && allowed[ic] & value) uniq_col = false;
            }
            if (!(uniq_3x3 || uniq_row || uniq_col)) return false;
        }
    }
    return uniq_row || uniq_col || uniq_3x3;
  },

  acceptable(board, index, value) {
    let { row, col } = this.i2rc(index);
    for (let i = 0; i < 9; ++i) {
        if (board[this.rc2i(i, col)] == value || board[this.rc2i(row, i)] == value)
            return false;
    }
    let r1 = Math.floor(row / 3) * 3;
    let c1 = Math.floor(col / 3) * 3;
    for (let r = r1; r < r1 + 3; ++r) {
        for (let c = c1; c < c1 + 3; ++c) {
            if (board[this.rc2i(r, c)] == value) return false;
        }
    }
    return true;
  },

  analyze(board) {
    console.log(board);
    let allowed = board.map((x, i) => x ? 0 : this.getMoves(board, i));
    let bestIndex, bestLen = 100;
    for (let i = 0; i < 81; i++) {
      console.log(board[i]);
      if (board[i] == 0) {
        let moves = allowed[i];
        let len = 0;
        for (let m = 1; moves; m <<= 1) if (moves & m) {
            ++len;
            if (this.unique(allowed, i, m)) {
                allowed[i] = m;
                len = 1;
                break;
            }
            moves ^= m;
        }
        if (len < bestLen) {
            bestLen = len;
            bestIndex = i;
            if (!bestLen) break;
        }
      }
    }
    return {
        index: bestIndex,
        moves: allowed[bestIndex],
        len: bestLen,
        allowed: allowed
    };
  },

  readBoard(board) {
    return board
        .map(el => {
            return el > 0 ? this.d2b(parseInt(el, 10)) : 0;
        });
  },

  solve(initboard) {
    let self = this;
    let el = self.container;
    let board = self.readBoard(initboard, false);
    let backtrack = 0;
    let guesswork = 0;
    let dcount = 0;
    let time = Date.now();
    if (solve()) {
        stats();
        //self.writeBytes(board);
        //el.classList.add("solved");
        alert("solved");
        console.log(board);
    } else {
        stats();
        alert("no solution");
    }
    function solve() {
        let { index, moves, len } = self.analyze(board);
        console.log("{index, moves, len} is: ", {index, moves, len});
        if (index == null) return true;
        if (len > 1) guesswork++;
        for (let m = 1; moves; m <<= 1) {
            if (moves & m) {
                dcount++;
                board[index] = m;
                if (solve()) return true;
                moves ^= m;
            }
        }
        board[index] = 0;
        ++backtrack;
        return false;
    }
    function stats() {
        console.log(`${dcount} digits placed<br>${backtrack} take-backs<br>${guesswork} guesses<br>${Date.now() - time} milliseconds`);
    }
  },


  // different source code for generating random boards (under)

  newStartingBoard  (holes) {
    // Reset global iteration counter to 0 and Try to generate a new game. 
    // If counter reaches its maximum limit in the fillPuzzle function, current attemp will abort
    // To prevent the abort from crashing the script, the error is caught and used to re-run
    // this function
    try {
      counter = 0
      let solvedBoard = newSolvedBoard();
  
      // Clone the populated board and poke holes in it. 
      // Stored the removed values for clues
      let [removedVals, startingBoard] = pokeHoles( solvedBoard.map ( row => row.slice() ), holes)
  
      return [removedVals, startingBoard, solvedBoard]
      
    } catch (error) {
      return newStartingBoard(holes)
    }
  },

  newSolvedBoard() {
    const newBoard = BLANK_BOARD.map(row => row.slice() ) // Create an unaffiliated clone of a fresh board
    fillPuzzle(newBoard) // Populate the board using backtracking algorithm
    return newBoard;
  },

  safeToPlace( puzzleArray, emptyCell, num) {
    return rowSafe(puzzleArray, emptyCell, num) && 
    colSafe(puzzleArray, emptyCell, num) && 
    boxSafe(puzzleArray, emptyCell, num) 
  }

};

const colors = {
  current: 'lime',
  other: 'white',
};

const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  isPlayingNumber: (str) => {
    if (str.trim() === '') {
      return false;
    }
  
    return !isNaN(str) && str != 0;
  }
};

export {Game as App};