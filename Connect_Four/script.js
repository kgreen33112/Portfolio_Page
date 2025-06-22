function Gameboard(){
  const rows = 6;
  const columns = 7;
  const board = [];
  
  for (let i=0; i<rows; i++) {
    board[i] = [];
    for (let j=0; j<columns; j++) {
      board[i].push(Cell());
    }
  }
  const getBoard = () => board;
  const dropToken = (column, player) => {
    // Find the lowest available row in the specified column
    for (let i = rows - 1; i >= 0; i--) {
      if (board[i][column].getValue() === 0) {
        board[i][column].addToken(player);
        return true;
      }
    }
    return false; // Column is full
  };
  
  const checkWinner = () => {
    // Check horizontal wins
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns - 3; col++) {
        const cell1 = board[row][col].getValue();
        if (cell1 !== 0 && 
            cell1 === board[row][col + 1].getValue() &&
            cell1 === board[row][col + 2].getValue() &&
            cell1 === board[row][col + 3].getValue()) {
          return cell1;
        }
      }
    }
    
    // Check vertical wins
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 0; col < columns; col++) {
        const cell1 = board[row][col].getValue();
        if (cell1 !== 0 && 
            cell1 === board[row + 1][col].getValue() &&
            cell1 === board[row + 2][col].getValue() &&
            cell1 === board[row + 3][col].getValue()) {
          return cell1;
        }
      }
    }
    
    // Check diagonal wins (top-left to bottom-right)
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 0; col < columns - 3; col++) {
        const cell1 = board[row][col].getValue();
        if (cell1 !== 0 && 
            cell1 === board[row + 1][col + 1].getValue() &&
            cell1 === board[row + 2][col + 2].getValue() &&
            cell1 === board[row + 3][col + 3].getValue()) {
          return cell1;
        }
      }
    }
    
    // Check diagonal wins (top-right to bottom-left)
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 3; col < columns; col++) {
        const cell1 = board[row][col].getValue();
        if (cell1 !== 0 && 
            cell1 === board[row + 1][col - 1].getValue() &&
            cell1 === board[row + 2][col - 2].getValue() &&
            cell1 === board[row + 3][col - 3].getValue()) {
          return cell1;
        }
      }
    }
    
    return null; // No winner
  };
  
  const isBoardFull = () => {
    return board[0].every(cell => cell.getValue() !== 0);
  };
  
  const printBoard = () => {
    const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
    console.log(boardWithCellValues);
  };
  return { getBoard, dropToken, printBoard, checkWinner, isBoardFull };
}

function Cell(){
  let value = 0;
  const addToken = (player) => {
    value = player;
  };
  
  const getValue = () => value;
  return {
    addToken,
    getValue
  };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
){
  const board = Gameboard();
  const players = [
    {
      name: playerOneName,
      token: 1
    },
    {
      name: playerTwoName,
      token: 2
    }
  ];
  
  let activePlayer = players[0];
  let gameOver = false;
  let winner = null;
  
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  
  const getActivePlayer = () => activePlayer;
  const getGameOver = () => gameOver;
  const getWinner = () => winner;
  
  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };
  
  const playRound = (column) => {
    if (gameOver) return false;
    
    console.log(`Dropping ${getActivePlayer().name}'s token into column ${column}...`);
    const success = board.dropToken(column, getActivePlayer().token);
    
    if (!success) return false; // Column was full
    
    // Check for winner
    const winnerToken = board.checkWinner();
    if (winnerToken) {
      winner = players.find(player => player.token === winnerToken);
      gameOver = true;
      console.log(`${winner.name} wins!`);
      return true;
    }
    
    // Check for tie
    if (board.isBoardFull()) {
      gameOver = true;
      console.log("It's a tie!");
      return true;
    }
    
    switchPlayerTurn();
    printNewRound();
    return true;
  };
  
  const resetGame = () => {
    // Reset the board by creating new cells
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        board.getBoard()[i][j] = Cell();
      }
    }
    activePlayer = players[0];
    gameOver = false;
    winner = null;
    printNewRound();
  };
  
  printNewRound();
  return {
    playRound,
    getActivePlayer,
    getGameOver,
    getWinner,
    resetGame,
    getBoard: board.getBoard
  }; 
}

function ScreenController(){
  const game = GameController();
  const playerTurnDiv = document.querySelector('.turn');
  const boardDiv = document.querySelector('.board');
  
  const updateScreen = () => {
    // Clear board
    boardDiv.textContent = "";
    
    // Get newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const gameOver = game.getGameOver();
    const winner = game.getWinner();
    
    // Display game status
    if (gameOver) {
      if (winner) {
        playerTurnDiv.textContent = `🎉 ${winner.name} wins! 🎉`;
      } else {
        playerTurnDiv.textContent = `🤝 It's a tie! 🤝`;
      }
    } else {
      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    }
    
    // Render board squares
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellButton = document.createElement("button");
        
        cellButton.classList.add("cell");
        
        // Create a data-attribute to identify the column; This makes it easier to pass into playRound function
        cellButton.dataset.column = columnIndex;
        const cellValue = cell.getValue();
        if (cellValue === 1) {
          cellButton.textContent = "🔴"; // Player 1 - Red
        } else if (cellValue === 2) {
          cellButton.textContent = "🟡"; // Player 2 - Yellow
        } else {
          cellButton.textContent = ""; // Empty cell
        }
        
        // Disable clicking if game is over
        if (gameOver) {
          cellButton.disabled = true;
          cellButton.style.cursor = "not-allowed";
        }
        
        boardDiv.appendChild(cellButton);
      })
    })
    
    // Add reset button if game is over
    if (gameOver) {
      const resetButton = document.createElement("button");
      resetButton.textContent = "Play Again";
      resetButton.classList.add("reset-button");
      resetButton.addEventListener("click", () => {
        game.resetGame();
        updateScreen();
      });
      boardDiv.parentNode.appendChild(resetButton);
    } else {
      // Remove reset button if it exists
      const existingResetButton = document.querySelector('.reset-button');
      if (existingResetButton) {
        existingResetButton.remove();
      }
    }
  }
  
  // Add event listener for the board
  function clickHandlerBoard(e){
    const selectedColumn = e.target.dataset.column;
    
    // Make sure a column is clicked and game is not over
    if (!selectedColumn || game.getGameOver()) return;
    
    game.playRound(selectedColumn);
    updateScreen();
  }
  
  boardDiv.addEventListener("click", clickHandlerBoard);
  
  // Initial render
  updateScreen();
}

ScreenController();
