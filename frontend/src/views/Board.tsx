import { useEffect, useState } from "react"

import Piece from "../components/Piece.tsx"
import "./styles/Board.css"
import { PieceType } from "../type.ts"
import { copyBoard } from "./utils.ts"

export default function Board({board, setBoard} : {
  board: string[][], setBoard: React.Dispatch<React.SetStateAction<string[][]>>
}) { // in future, Board will get input fen-str and generate corresponding position

  const [firstPiece, setFirstPiece] = useState<PieceType>({piece: "none", row: -1, col: -1})
  const [finalPiece, setFinalPiece] = useState<PieceType>({piece: "none", row: -1, col: -1})

  console.log("---")
  console.log("first:" + firstPiece.piece + firstPiece.row + firstPiece.col)
  console.log("second:" + finalPiece.piece + finalPiece.row + finalPiece.col)

  useEffect(() => {
    if (finalPiece.piece !== "none") {
      const newBoard = copyBoard(board)
      console.log(`move ${firstPiece.piece} from ${firstPiece.row}-${firstPiece.col} to ${finalPiece.row}-${finalPiece.col}`)
      newBoard[finalPiece.row][finalPiece.col] = firstPiece.piece
      newBoard[firstPiece.row][firstPiece.col] = ""
      setFirstPiece({piece: "none", row: -1, col: -1})
      setFinalPiece({piece: "none", row: -1, col: -1})
      setBoard(newBoard)
    }
  }, [finalPiece])

  return (
    <section id="board">
      {board.flatMap((row, i) => row.map((piece, j) =>
        <Piece
          key={`${i}-${j}`}
          firstPiece={firstPiece} setFirstPiece={setFirstPiece}
          finalPiece={finalPiece} setFinalPiece={setFinalPiece}
          piece={{piece: piece, row: i, col: j}}
        /> 
      ))}
    </section>
  )
}