import { PieceType} from "../type.ts"
import { comparePiece } from "../utils/utils.ts"
import "./styles/Piece.css"

export default function Piece({firstPiece, setFirstPiece, finalPiece, setFinalPiece, piece}: {
  firstPiece: PieceType, setFirstPiece: React.Dispatch<React.SetStateAction<PieceType>>
  finalPiece: PieceType, setFinalPiece: React.Dispatch<React.SetStateAction<PieceType>>
  piece: PieceType
}) {

  const isVisible = (comparePiece(firstPiece, piece))? true : false
  const isDot = (piece.piece === "")? true: false
  const pieceSide = (piece.piece === "")? "" : piece.piece[0] as "" | "r" | "b"

  const handleClickPiece = () => {
    // if there is no first piece then set first piece
    if (firstPiece.piece === "none") {
      if (piece.piece !== "") {
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

  return (
    <div 
      draggable
      onClick={handleClickPiece} 
      className={`${isDot? "dot" : "piece"} ${pieceSide} p-${piece.piece} ${(isVisible)? "p-visible" : ""}`} 
      style={{translate: `${59 * piece.col}px ${59 * piece.row + 9}px`}}
    ></div>
  )
}