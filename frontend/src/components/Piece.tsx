import { PieceType} from "../type.ts"
import "./styles/Piece.css"

export default function Piece({isVisible, piece, handleClickPiece}: {
  isVisible: boolean,
  piece: PieceType,
  handleClickPiece: () => void
}) {

  const isDot = (piece.piece === "")? true: false
  const pieceSide = (piece.piece === "")? "" : piece.piece[0] as "" | "r" | "b"

  return (
    <div
      draggable
      onClick={handleClickPiece}
      className={`${isDot? "dot" : "piece"} ${pieceSide} p-${piece.piece} ${(isVisible)? "p-visible" : ""}`} 
      style={{translate: `${59 * piece.col}px ${59 * piece.row + 9}px`}}
    ></div>
  )
}