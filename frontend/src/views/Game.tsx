import { loadBoard } from "./utils";
import Board from "./Board";
import { useEffect, useState } from "react";

export default function Game() {
  const [board, setBoard] = useState<string[][]>([])
  const [curPlayer, setCurPlayer] = useState<"r" | "b" | "">("")
  const [curTurn, setCurTurn] = useState(0)
  const [move, setMove] = useState("")

  console.log(board)

  useEffect(() => { 
    // initial load
    const loadBoardObj = loadBoard()
    console.log(`loadSuccesful: ${loadBoardObj.loadSuccessful}, curPlayer: ${loadBoardObj.curPlayer}, curTurn: ${loadBoardObj.curTurn}`)
    setBoard(loadBoardObj.board)
    setCurPlayer(loadBoardObj.curPlayer)
    setCurTurn(loadBoardObj.curTurn)
  }, [])

  return (
    <section id="game">
      <div>Turn: {curTurn}</div>
      <div>Opponent</div>
      <Board board={board} setBoard={setBoard}/>
      <div>You</div>
    </section>
  )
}