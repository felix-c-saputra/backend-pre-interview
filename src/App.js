import React from 'react';
import source from './sudoku.js';
import { Row, Col } from "react-bootstrap";

class EnTrakSudoku extends React.Component {
  constructor(props) {
    super(props);

    let testCases = this.handleFiles(source);

    this.state = {
      squareHelper: [
        [1, 1, 1, 2, 2, 2, 3, 3, 3],
        [1, 1, 1, 2, 2, 2, 3, 3, 3],
        [1, 1, 1, 2, 2, 2, 3, 3, 3],
        [4, 4, 4, 5, 5, 5, 6, 6, 6],
        [4, 4, 4, 5, 5, 5, 6, 6, 6],
        [4, 4, 4, 5, 5, 5, 6, 6, 6],
        [7, 7, 7, 8, 8, 8, 9, 9, 9],
        [7, 7, 7, 8, 8, 8, 9, 9, 9],
        [7, 7, 7, 8, 8, 8, 9, 9, 9]
      ],
      testCases
    }
  }

  handleFiles(source) {
    let stringArray = source.split("\n");
    let testCases = [];

    for (let i = 0; i < stringArray.length; i += 10) {
      let testCase = {};
      testCase.name = stringArray[i];
      testCase.board = [
        stringArray[i+1].split('').map(x => parseInt(x)),
        stringArray[i+2].split('').map(x => parseInt(x)),
        stringArray[i+3].split('').map(x => parseInt(x)),
        stringArray[i+4].split('').map(x => parseInt(x)),
        stringArray[i+5].split('').map(x => parseInt(x)),
        stringArray[i+6].split('').map(x => parseInt(x)),
        stringArray[i+7].split('').map(x => parseInt(x)),
        stringArray[i+8].split('').map(x => parseInt(x)),
        stringArray[i+9].split('').map(x => parseInt(x))
      ];
      testCases.push(testCase);
    }

    return testCases;
  }

  getRow = (board, row) => {
    return board[row];
  }

  getColumn = (board, column) => {
    let col = [];
    for (let row = 0; row < 9; row++) {
      col.push(board[row][column]);
    }
    return col;
  }

  getSquare = (board, square) => {
    let cells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (square === this.state.squareHelper[r][c]) {
          cells.push(board[r][c]);
        }
      }
    }
    return cells;
  }
      
  completeCell = (board, r, c) => {
    let used = [...this.getRow(board, r), ...this.getColumn(board, c), ...this.getSquare(board, this.state.squareHelper[r][c])];
    let possibilities = [];

    for (let p = 1; p <= 9; p++) {
      if (!used.includes(p)) {
        possibilities.push(p);
      }
    }

    if (possibilities.length === 1) {
      board[r][c] = possibilities[0];
      return true;
    }
    else {
      board[r][c] = possibilities;
      return false;
    }
  }

  appearsOnceOnly = (board, possibilities, segment, r, c) => {
    let updated = false;
    for (let i = 0; i < possibilities.length; i++) {
      let possibility = possibilities[i];
      let counter = 0;

      segment.forEach(cell => {
        if (Array.isArray(cell)) {
          if (cell.includes(possibility)) {
            counter++;
          }
        }
        else {
          if (cell === possibility) {
            counter++;
          }
        }
      });

      if (counter === 1) {
        board[r][c] = possibility;
        updated = true;
        break;
      }
    }
    return updated;
  }

  compare = (expected, actual) => {
    let array1 = expected.slice();
    let array2 = actual.slice();
    return array1.length === array2.length && array1.sort().every(function (value, index) { return value === array2.sort()[index]; });
  }

  isSolved = (board) => {
    let expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let valid = true;
    
    for (let r = 0; r < 9 && valid === true; r++) {
      if (!this.compare(expected, this.getRow(board, r))) {
        valid = false;
      }
    }
    
    for (let c = 0; c < 9 && valid === true; c++) {
      if (!this.compare(expected, this.getColumn(board, c))) {
        valid = false;
      }
    }
    
    for (let q = 1; q < 9 && valid === true; q++) {
      if (!this.compare(expected, this.getSquare(board, q))) {
        valid = false;
      }
    }
    return valid;
  }

  recursiveSolve = (orig_board) => {
    let board = JSON.parse(JSON.stringify(orig_board));

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          this.completeCell(board, r, c);
          if (this.isSolved(board)) {return board;}
          let cell = board[r][c];
          
          if (Array.isArray(cell)) {
            for (let i = 0; i < cell.length; i++) {
              let board_2 = JSON.parse(JSON.stringify(board));
              
              board_2[r][c] = cell[i];
              let completed_board = this.recursiveSolve(board_2);
              if (completed_board) {
                return completed_board;
              }
            }
            return false;
          }
        }
      }
    }

    return false;
  }
  
  singleValueSolve = (board) => {
    let updated = false;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          updated = this.completeCell(board, r, c) || updated;
        }
      }
    }
    
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (Array.isArray(board[r][c])) {
          let possibilities = board[r][c];
          updated = this.appearsOnceOnly(board, possibilities, this.getRow(board, r), r, c) ||
                    this.appearsOnceOnly(board, possibilities, this.getColumn(board, c), r, c) ||
                    this.appearsOnceOnly(board, possibilities, this.getSquare(board, this.state.squareHelper[r][c]), r, c) || updated;
        }
      }
    }

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (Array.isArray(board[r][c])) {
          board[r][c] = 0;
        }
      }
    }

    return updated;
  }

  cloneBoard = (board) => {
    let cloned = [];
    board.forEach(row => {
      cloned.push([...row]);
    });
    return cloned;
  }

  solve = (board) => {
    let clonedBoard = this.cloneBoard(board);
    let updated = true, solved = false;

    while (updated && !solved) {
      updated = this.singleValueSolve(clonedBoard);
      solved = this.isSolved(clonedBoard);
    }

    if (!solved) {
      clonedBoard = this.recursiveSolve(clonedBoard);
      solved = this.isSolved(clonedBoard);
    }

    return clonedBoard;
  }

  getSumFirstThree = (board) => {
    return board[0][0] + board[0][1] + board[0][2];
  }

  renderBoard = (board, isSolution) => {
    let result =  [];

    for (let i = 0; i < 9; i++) {
      if (i !== 0 && i % 3 === 0) {
        result.push(<Row><Col xs={12}>-------------</Col></Row>)
      }

      result.push(
        <Row>
          {
            (i === 0 && isSolution)
              ? <Col xs={12}>
                  |<span class="font-weight-bold">{board[i][0]}{board[i][1]}{board[i][2]}</span>
                  |{board[i][3]}{board[i][4]}{board[i][5]}
                  |{board[i][6]}{board[i][7]}{board[i][8]}|
                </Col>
              : <Col xs={12}>
                  |{board[i][0]}{board[i][1]}{board[i][2]}
                  |{board[i][3]}{board[i][4]}{board[i][5]}
                  |{board[i][6]}{board[i][7]}{board[i][8]}|
                </Col>
          }
        </Row>
      );
    }

    return result;
  }

  getBackgroundColor = (index) => {
    return (index % 2 === 0) ? "#F6F6F6" : "#EEE";
  }

  render() {
    let total = 0;
    
    return (
      <pre className="container">
        <Row>
          <Col xs={{span:12, order:1}}>
            { 
              this.state.testCases.map((testCase, index) => {
                let solution = this.solve(testCase.board);
                let sumFirstThree = this.getSumFirstThree(solution);
                total += sumFirstThree;
                
                return (
                  <Row key={index} className="p-2" style={{backgroundColor:this.getBackgroundColor(index)}}>
                    <Col xs={12}>
                      <Row>
                        <Col xs={12}>
                          <h5 className="font-weight-bold">{ testCase.name }</h5>
                        </Col>
                      </Row>
          
                      <Row>
                        <Col xs={12} md={6}>
                          <Row className="mb-2">
                            <Col md={12} className="mb-2 font-weight-bold"># question</Col>
                            <Col md={12}>{ this.renderBoard(testCase.board, false) }</Col>
                          </Row>
                        </Col>
          
                        <Col xs={12} md={6}>
                          <Row className="mb-2">
                            <Col md={12} className="mb-2 font-weight-bold"># solution</Col>
                            <Col md={12}>{ this.renderBoard(solution, true) }</Col>
                          </Row>
                        </Col>
                      </Row>
          
                      <Row className="mb-2 font-weight-bold">
                        <Col xs={12}># sum of the first three numbers in the solutions's top row: {solution[0][0]}+{solution[0][1]}+{solution[0][2]} = {sumFirstThree}</Col>
                      </Row>
                    </Col>
                  </Row>
                );
              })
            }
          </Col>
          
          <Col xs={{span:12, order:0}}>
            <Row className="p-2 font-weight-bold" style={{backgroundColor:"#EEE"}}>
              <Col xs={12}># sum for each first three numbers of the 50 puzzles: {total}</Col>
            </Row>
          </Col>
        </Row>
      </pre>
    )
  }
}

export default EnTrakSudoku