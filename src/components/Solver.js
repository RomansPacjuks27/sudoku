import { utils, colors } from './Utils';

export const solver = {

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

  b2d(digit) {
    return (solver.getBaseLog(2, digit)) + 1;
  },

  getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  },

  fillPuzzle(board) {
    let solvingTry = 0;
    let resultingBoard = new Array(81).fill(0);
    let fillCount = 4;
    do {
      solvingTry++;
      resultingBoard = new Array(81).fill(0);
      board.map((x, idx) => board[idx] = 0);
        let rndCells = utils.randomSeries(0, 80, fillCount);
        rndCells.forEach((i, idx) => {
          let allowed = 0;
          let moves = [];
          let possibleMoves = this.getMoves(board, i);
          for (let m = 1; possibleMoves; m <<= 1) {
            if (possibleMoves & m) {
              allowed++;
              moves.push(this.b2d(m));
              possibleMoves ^= m;
            }
          }
          
          if(allowed > 0) {
            let cellVal = moves[utils.random(0, allowed-1)];
            board[i] = cellVal;
          }
        });
      
      console.log(`Filled, solving try: ${solvingTry}`);
      resultingBoard = solver.solve(board);
    } while((resultingBoard == null || resultingBoard.length == 0) && solvingTry < 20)
    return resultingBoard;
  },

  getMoves(board, index) { // 1. algorithm - plain
    let { row, col } = this.i2rc(index); //row = 1; col = 7
    let r1 = 3 * (row / 3 | 0); //r1 = 0;
    let c1 = 3 * (col / 3 | 0); //c1 = 2*3 = 6
    let moves = 0;
    for (let r = r1, i = 0; r < r1 + 3; r++) {
        for (let c = c1; c < c1 + 3; c++, i++) {
            moves |= board[this.rc2i(r, c)] //add any occuring number in cell's 3x3 box
                | board[this.rc2i(row, i)] //add any occuring number in current cell's row
                | board[this.rc2i(i, col)]; //add any occuring number in current cell's column
        }
    }
    return moves ^ 511; // switch given zeroes to 1 (xor with 8 bits), which are candidates
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
        if ((i != row && board[this.rc2i(i, col)] == value) || 
            (i != col && board[this.rc2i(row, i)] == value)) 
              return false;
    }
    let r1 = Math.floor(row / 3) * 3;
    let c1 = Math.floor(col / 3) * 3;
    for (let r = r1; r < r1 + 3; ++r) {
        for (let c = c1; c < c1 + 3; ++c) {
            if ((r != row && c != col) && board[this.rc2i(r, c)] == value)  
              return false;
        }
    }
    return true;
  },

  analyze(board) {
    let allowed = board.map((x, i) => x ? 0 : this.getMoves(board, i));
    let bestIndex, bestLen = 100;
    for (let i = 0; i < 81; i++) {
      if (board[i] == 0) {
        let moves = allowed[i]; //pick each cell's candidates
        let len = 0;
        for (let m = 1; moves; m <<= 1) if (moves & m) { //count how many candidates are in the cell
            ++len;
            if (this.unique(allowed, i, m)) { // if the candidate is a unique number to be filled, cancel loop, and choose this candidate as the best
                allowed[i] = m; // reduce available candidate as only this candidate and set count of it to 1
                len = 1; 
                break;
            }
            moves ^= m;
        }
        if (len < bestLen) {
            bestLen = len; //find a cell with minimum available candidates and get this cell's index and candidates' count
            bestIndex = i;
            if (!bestLen) break; //if empty cell has length of candidates equal to 0, puzzle is unsolvable, break the loop
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
    let board = self.readBoard(initboard);
    let backtrack = 0;
    let guesswork = 0;
    let dcount = 0;
    let time = Date.now();
    let result = solve();
    if (result === true) {
        if(board.length != 0)
          stats();
        return board;
    } else {
        //stats();
        board = [];
        return null;
    }
    function solve() {
      let { index, moves, len } = self.analyze(board);
      if(Date.now() - time > 100)
      {
        board = [];
        return -1;
      }
      if (index == null) return true;
      for (let m = 1; moves; m <<= 1) {
          if (moves & m) {
              dcount++;
              board[index] = m;
              let res = solve();
              if (res) return true;
              if (res == -1) {
                board[index] = 0;
               return false;
              }
              moves ^= m;
            }
      }
      board[index] = 0;
      return false;
  }
    function stats() {
        console.log(`${dcount} digits placed\n${backtrack} take-backs\n${guesswork} guesses\n${Date.now() - time} milliseconds\n`);
    }
  },

  newStartingBoard  () {
    try {
      let solvedBoard = this.newSolvedBoard();
      let startingBoard = this.pokeHoles(solvedBoard);
      return [startingBoard, solvedBoard];
    } catch (error) {
      console.log(error);
    }
  },

  newSolvedBoard() {
    const newBoard = utils.BLANK_BOARD;
    return this.fillPuzzle(newBoard); 
  },

  safeToPlace( puzzleArray, emptyCell, num) {
    return rowSafe(puzzleArray, emptyCell, num) && 
    colSafe(puzzleArray, emptyCell, num) && 
    boxSafe(puzzleArray, emptyCell, num) 
  },

  // 1. option:

  // remove 4-5 holes
  // and by each iteration find one more hole to remove by doing:
  // searching a cell that when value removed from will have as more candidates as possible by 1-2 simple techniques (row/column check, sole candidate)
  // for easy: continue searching for this cell among random 10% cells of all empty cells,
  // for medium: continue searching for this cell among random 30% cells of all empty cells,
  // for hard: continue searching for this cell among random 70% cells of all empty cells,
  //
  // then recalculate all empty cells' candidate count and and total difficulty,
  // stop iterations when difficulty level is matched or when hole count is capped at determined number

  //todo: after removing each cell (or after removing all needed cells) check for puzzle solution unicity

  pokeHoles(board) {
    let cellStats = [];
    let dummyBoard = board.slice();

    let emptyHoleCoef = 20; //difficulty (5, 20, 30)
    let emptyHoleCount = utils.random(20 + emptyHoleCoef, 25 + emptyHoleCoef);
    let searchCoef = 0.25; //dificulty (0.1, 0.25, 0.4)
    
    let initialHoleCount = utils.random(8, 8); 
    let pokedIdx = utils.randomSeries(0, 80, initialHoleCount);
    pokedIdx.map(x => dummyBoard[x] = 0);
    
    do {
      let mostCandidates = 0;
      let bestToErase = 0;
      let filledCells = dummyBoard.map((x, idx) => (x != 0) ? idx : -1).filter(x => x >= 0);
      let cellStack = Math.floor(filledCells.length * searchCoef);
      for (let it = 0; it < cellStack; it++) {
        let len = 0;
        let rndCellIndex = utils.random(0, filledCells.length - 1);
        let rndCell = filledCells[rndCellIndex];
        dummyBoard[rndCell] = 0;
        let allowed = dummyBoard.map((x, i) => x ? 0 : this.getMoves(dummyBoard, i));
        let possibleMoves = this.getMoves(dummyBoard, rndCell);
        for (let m = 1; possibleMoves; m <<= 1) {
          if (possibleMoves & m) {
            len++;
            if (this.unique(allowed, rndCell, m)) { 
              allowed[rndCell] = m; 
              len = 1;
              break;
            }
            possibleMoves ^= m;
          }
        }

        dummyBoard[rndCell] = board[rndCell];
        if (len > mostCandidates) {
          mostCandidates = len;
          bestToErase = rndCell;
        }
      }
      dummyBoard[bestToErase] = 0;
      pokedIdx.push(bestToErase);

      // reevaluating all empty cell candidates
      cellStats = [];
      pokedIdx.forEach(i => {
        let len = 0;
        let possibleMoves = this.getMoves(dummyBoard, i);
        let allowed = dummyBoard.map((x, i) => x ? 0 : this.getMoves(dummyBoard, i));
        for (let m = 1; possibleMoves; m <<= 1) {
          if (possibleMoves & m) {
            len++;
            if (this.unique(allowed, i, m)) { 
              len = 1;
              break;
            }
            possibleMoves ^= m;
          }
        }
        cellStats.push(len);
      });

    } while( pokedIdx.length < emptyHoleCount)

    
    for(let i = 0; i < 9; i++) {
      console.log(`Empty cells with ${i+1} candidates: ${cellStats.filter(x => x == (i+1)).length} \n`);
    }

    if(this.solve(dummyBoard) != null) {
      return dummyBoard;
    }
    else {
      alert(`No solution!`);
      return null;
    }
  },

};