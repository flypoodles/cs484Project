import "./styles/Deadpiece.css"

export default function DeadPiece({piece} : {
  piece: string
}) {
  return (
    <div 
      style={{
        width: "20px",
        height: "20px",
      }}
      className={`p-${piece}`}
    ></div>
  )
}