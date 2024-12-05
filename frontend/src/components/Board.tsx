import { useEffect, useState } from "react"

import Piece from "./Piece.tsx"
import "./styles/Board.css"
import { PieceType } from "../type.ts"
import { boardToFen, comparePiece } from "../utils/utils.ts"
import { Socket } from "socket.io-client"

export default function Board({board, side, socket, yourTurn, setYourTurn} : {
  board: string[][],
  side: string,
  socket: Socket,
  yourTurn: boolean,
  setYourTurn:  React.Dispatch<React.SetStateAction<boolean>>
}) { // in future, Board will get input fen-str and generate corresponding position

  const [firstPiece, setFirstPiece] = useState<PieceType>({piece: "none", row: -1, col: -1})
  const [finalPiece, setFinalPiece] = useState<PieceType>({piece: "none", row: -1, col: -1})

  useEffect(() => {
    if (finalPiece.piece !== "none") {
      const boardFen = boardToFen(board)
      socket.emit("move", [firstPiece.row, firstPiece.col], [finalPiece.row, finalPiece.col], firstPiece.piece, boardFen)
      setYourTurn(false)
      setFirstPiece({piece: "none", row: -1, col: -1})
      setFinalPiece({piece: "none", row: -1, col: -1})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalPiece])

  const onClickPiece = (piece: PieceType) => {
    const pieceSide = (piece.piece === "")? "" : piece.piece[0] as "" | "r" | "b"

    if (yourTurn) {
      // if there is no first piece then set first piece
      if (firstPiece.piece === "none") {
        if (piece.piece !== "" && pieceSide == side) {
          setFirstPiece(piece)
        }
      }
      // else set final piece if appropriate
      else {
        const firstPieceSide = firstPiece.piece[0]

        // if the first piece == the clicked piece then unclick the piece
        if (comparePiece(firstPiece, piece)) {
          setFirstPiece({piece: "none", row: -1, col: -1})
        }
        // if the first piece and the clicked piece is the same side, then set first piece to that clicked piece to enable visible
        else if (firstPieceSide == pieceSide) {
          setFirstPiece(piece)
        }
        // else then set final piece = clicked piece
        else {
          setFinalPiece({piece: firstPiece.piece, row: piece.row, col: piece.col})
        }
      }
    }
  }

  return (
    <div id="board">
      {board.flatMap((row, i) => row.map((piece, j) =>
        <Piece
          key={`${i}-${j}`}
          isVisible={comparePiece(firstPiece, {piece: piece, row: i, col: j})? true : false}
          handleClickPiece={() => onClickPiece({piece: piece, row: i, col: j})}
          piece={{piece: piece, row: i, col: j}}
        />
      ))}
    </div>
  )
}