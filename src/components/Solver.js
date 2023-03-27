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
      let resultingBoard = new Array(81).fill(0);
      let allowed = new Array(81).fill(0);
      do {
        resultingBoard = new Array(81).fill(0);
        board.map((x, idx) => board[idx] = 0);
  
          let numbers = [1,2,3,4,5,6,7,8,9];
          for(let c = 2; c < 5; c++)
          {
            for(let r = 2; r < 5; r++)
            {
              let rndNumber = utils.random(0, numbers.length - 1);
              board[this.rc2i(r, c)] = numbers[rndNumber];
              numbers.splice(rndNumber, 1);
            }
          }
  
          for(let i = 0; i < 80; i++)
          {
            if(!board[i]) {
              let cellMoves = this.getMoves(board, i);
              for (let m = 1; cellMoves; m <<= 1) {
                if (cellMoves & m) {
                  allowed[i] += 1;
                  cellMoves ^= m;
                }
              }
            }
          }
        
        resultingBoard = solver.solve(board);
      } while(resultingBoard == null)
      return resultingBoard;
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
      let board = self.readBoard(initboard, false);
      let backtrack = 0;
      let guesswork = 0;
      let dcount = 0;
      let time = Date.now();
      let result = solve(false);
      if (result === true) {
          //stats();
          return board;
      } else {
          //stats();
          board = [];
          return null;
      }
      function solve(abrupt = false) {
          let { index, moves, len } = self.analyze(board);
          if(abrupt)
            return false;
          if(Date.now() - time > 1000)
          {
            board = [];
            return -1;
          }
          if (index == null) return true;
          if (len > 1) guesswork++;
          for (let m = 1; moves; m <<= 1) {
              if (moves & m) {
                  dcount++;
                  board[index] = m;
                  let res = solve();  
                  if (res) return true;
                  if (res == -1) {
                    board[index] = 0;
                    abrupt = true;
                   return false;
                  }
                  moves ^= m;
              }
          }
          board[index] = 0;
          ++backtrack;
          return false;
      }
      function stats() {
          console.log(`${dcount} digits placed\n${backtrack} take-backs\n${guesswork} guesses\n${Date.now() - time} milliseconds\n`);
      }
    },
  
    newStartingBoard  () {
      // Reset global iteration counter to 0 and Try to generate a new game. 
      // If counter reaches its maximum limit in the fillPuzzle function, current attemp will abort
      // To prevent the abort from crashing the script, the error is caught and used to re-run
      // this function
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
  
    pokeHoles(board) {
      var holeCount = utils.random(5,7);
      var pokedIdx = utils.randomSeries(0, 80, holeCount);
      pokedIdx.map(x => board[x] = 0);
      return board;
    }
  
  };