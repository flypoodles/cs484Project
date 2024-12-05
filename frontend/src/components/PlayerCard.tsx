import DeadPiece from "./DeadPiece"
import "./styles/PlayerCard.css"

export function PlayerCard({photo, username, deadPieces, ready, gameStatus, yourTurn} : {
  photo: string,
  username: string | undefined,
  deadPieces: string[],
  ready: boolean,
  gameStatus: boolean,
  yourTurn: boolean,
}) {
  
  return (
    <div className="player-card" style={(!yourTurn && gameStatus)? {backgroundColor: "rgb(105, 90, 62)"} : {}}>
      <img className="player-card-image" src={(photo === "") ? "/anonymous-avatar.webp" : photo} alt="player's photo" />
      <div className="player-card-info">
        <div style={{ fontWeight: "bold" }}>You: {username} {(ready && !gameStatus) ? "(ready)" : ""}</div>
        <ul className="player-card-deadPieces">
          {deadPieces.map((piece, index) => <DeadPiece key={index} piece={piece}/>)}
        </ul>
      </div>
    </div>
  )
}

export function OpponentCard({photo, username, deadPieces, ready, gameStatus, oppTurn}: {
  photo: string,
  username: string | undefined,
  deadPieces: string[],
  ready: boolean,
  gameStatus: boolean,
  oppTurn: boolean,
}) {
  return (
    <div className="opponent-card" style={(!oppTurn && gameStatus)? {backgroundColor: "rgb(105, 90, 62)"} : {}}>
      <img className="opponent-card-image" src={(photo === "") ? "/anonymous-avatar.webp" : photo} alt="opponent's photo" />
      <div className="opponent-card-info">
        <div style={{ fontWeight: "bold" }}>Opponent: {username} {(ready && !gameStatus) ? "(ready)" : ""}</div>
        <ul className="opponent-card-deadPieces">
          {deadPieces.map((piece, index) => <DeadPiece key={index} piece={piece}/>)}
        </ul>
      </div>
    </div>
  )
}
