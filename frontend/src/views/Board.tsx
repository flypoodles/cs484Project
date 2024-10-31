import { useEffect, useState } from "react"

import Piece from "../components/Piece.tsx"
import "./styles/Board.css"
import { Move, PieceType } from "../type.ts"

export default function Board({board, setMove} : {
  board: string[][], setMove: React.Dispatch<React.SetStateAction<Move | null>>
}) { // in future, Board will get input fen-str and generate corresponding position

  const [firstPiece, setFirstPiece] = useState<PieceType>({piece: "none", row: -1, col: -1})
  const [finalPiece, setFinalPiece] = useState<PieceType>({piece: "none", row: -1, col: -1})

  console.log("---")
  console.log("first:" + firstPiece.piece + firstPiece.row + firstPiece.col)
  console.log("second:" + finalPiece.piece + finalPiece.row + finalPiece.col)

  useEffect(() => {
    if (finalPiece.piece !== "none") {
      console.log(`move ${firstPiece.piece} from ${firstPiece.row}-${firstPiece.col} to ${finalPiece.row}-${finalPiece.col}`)
      setMove({piece: firstPiece.piece, from: [firstPiece.row, firstPiece.col], to: [finalPiece.row, finalPiece.col]})
      setFirstPiece({piece: "none", row: -1, col: -1})
      setFinalPiece({piece: "none", row: -1, col: -1})
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