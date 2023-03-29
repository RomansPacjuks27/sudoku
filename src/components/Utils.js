export const utils = {
    // Sum an array
    sum: arr => arr.reduce((acc, curr) => acc + curr, 0),
  
    // create an array of numbers between min and max (edges included)
    range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),
  
    // pick a random number between min and max (edges included)
    random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),
  
    randomSeries: (min, max, count) => {
      let arr = [];
      let num = 0;
      while(count)
      {
        num = min + Math.floor(Math.random() * (max - min + 1));
        if(!arr.includes(num))
        {
          arr.push(num);
          count--;
        }
      }
      return arr;
    },
  
    isPlayingNumber: (str) => {
      if (str.trim() === '') {
        return false;
      }
    
      return !isNaN(str) && str != 0;
    },
    
    BLANK_BOARD: Array(81).fill(0),
    BLANK_CANDIDATE_BOARD: Array(81).fill(Array(9).fill(false))
  };