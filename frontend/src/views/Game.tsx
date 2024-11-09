import { copyBoard, loadBoard } from "../components/utils";
import Board from "../components/Board";
import { useEffect, useState } from "react";
import { Move } from "../type";

export default function Game() {
  const [board, setBoard] = useState<string[][]>([])
  const [curPlayer, setCurPlayer] = useState<"r" | "b" | "">("")
  const [curTurn, setCurTurn] = useState(0)
  const [move, setMove] = useState<Move | null>(null)

  console.log(board)

  useEffect(() => { 
    // initial load
    if (move === null) {
      const loadBoardObj = loadBoard()
      console.log(`loadSuccesful: ${loadBoardObj.loadSuccessful}, curPlayer: ${loadBoardObj.curPlayer}, curTurn: ${loadBoardObj.curTurn}`)
      setBoard(loadBoardObj.board)
      setCurPlayer(loadBoardObj.curPlayer)
      setCurTurn(loadBoardObj.curTurn)
    }
    // if player makes a move, check if move is valid and make changes to board
    else {
      // TODO: check if a move is valid

      // TODO: send to backend

      // make changes to board
      console.log(move)
      const newBoard = copyBoard(board)
      newBoard[move.from[0]][move.from[1]] = ""
      newBoard[move.to[0]][move.to[1]] = move.piece
      setBoard(newBoard)
      setCurPlayer((curPlayer == "r")? "b" : "r")
      setCurTurn(curTurn + 1)
    }
  }, [move])

  return (
    <section id="game">
      <div>Turn: {curTurn}</div>
      <div style={(curPlayer == "b")? {fontWeight: "bold"} : {}}>Opponent</div>
      <Board board={board} setMove={setMove}/>
      <div style={(curPlayer == "r")? {fontWeight: "bold"} : {}}>You</div>
    </section>
  )
}