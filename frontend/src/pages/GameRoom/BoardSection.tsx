import { useState, useEffect } from "react";

import Board from "../../components/Board";
import { PlayerCard, OpponentCard} from "../../components/PlayerCard"
import { Socket } from "socket.io-client";
import { User } from "../../type";
import { fenToBoard, processDeadpiecesStr } from "../../utils/utils";
import { AuthContextType, useAuth } from "../../contexts/AuthContext";

export default function BoardSection({
  board,
  setBoard,
  setTurn,
  socket,
  player,
  playerReady,
  opponent,
  opponentReady,
  gameStatus,
  setGameStatus,
  setError,
  setCheck,
  yourTurn,
  setYourTurn,
  setPlayerReady,
  setOpponentReady
}: {
  board: string[][];
  setBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  setTurn: React.Dispatch<React.SetStateAction<number>>,
  socket: Socket;
  player: User;
  playerReady: boolean;
  opponent: User | null;
  opponentReady: boolean;
  gameStatus: boolean;
  setGameStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setCheck: React.Dispatch<React.SetStateAction<boolean>>,
  yourTurn: boolean,
  setYourTurn: React.Dispatch<React.SetStateAction<boolean>>,
  setPlayerReady: React.Dispatch<React.SetStateAction<boolean>>,
  setOpponentReady: React.Dispatch<React.SetStateAction<boolean>>,
}) {
  // const [board, setBoard] = useState<string[][]>([]);
  const [side, setSide] = useState<string>("");
  const [playerDeadPieces, setPlayerDeadPieces] = useState<string[]>([]); // NEWLY ADDED
  const [oppDeadPieces, setOppDeadPieces] = useState<string[]>([])

  const { profile, currentUser } = useAuth() as AuthContextType

  useEffect(() => {
    if (!gameStatus) {
      socket.on(
        "start",
        (
          yourTurn: boolean,
          turn: number,
          side: string,
          boardString: string
        ) => {
          console.log(
            `Start the game! yourTurn=${yourTurn} turn=${turn} side=${side} boardString=${boardString}`
          );
          setTurn(turn);
          setSide(side);
          setYourTurn(yourTurn);
          setCheck(false)
          setError("")
          setGameStatus(true);
          // populate the board and start the game
          const startBoard = fenToBoard(boardString).board;
          setBoard(startBoard);
        }
      );
    } else {
      socket.on(
        "end turn",
        (
          yourTurnNew: boolean,
          turnNew: number,
          boardFenNew: string,
          deadPieces: string,
          checked: boolean
        ) => {
          setError("");
          setYourTurn(yourTurnNew);
          setTurn(turnNew);
          const newBoard = fenToBoard(boardFenNew);
          setBoard(newBoard.board);
          const deadPiecesTuple = processDeadpiecesStr(deadPieces, side)
          setPlayerDeadPieces(deadPiecesTuple.playerDeadPieces)
          setOppDeadPieces(deadPiecesTuple.opponentDeadPieces)
          setCheck(checked); // NEWLY ADDED
        }
      );

      // NEWLY ADDED
      socket.on(
        "end",
        (
          winner: string,
          redUser: string,
          blackUser: string,
          turn: number,
          boardFenNew: string,
          deadPieces: string
        ) => {
          setTurn(turn);
          const deadPiecesTuple = processDeadpiecesStr(deadPieces, side)
          setPlayerDeadPieces(deadPiecesTuple.playerDeadPieces)
          setOppDeadPieces(deadPiecesTuple.opponentDeadPieces)
          const newBoard = fenToBoard(boardFenNew);
          setBoard(newBoard.board);
          alert(`winner : ${winner}`);
          setGameStatus(false)
          setPlayerReady(false);
          setOpponentReady(false);
        }
      );

      socket.on("move error", (message: string) => {
        console.log(message);
        setError(message);
        setYourTurn(true);
      });
    }

    return () => {
      if (!gameStatus) {
        socket.removeAllListeners("start");
      } else {
        socket.removeAllListeners("end turn");
        socket.removeAllListeners("end");
        socket.removeAllListeners("move error");
      }
    };
  }, [socket, gameStatus, setGameStatus, opponent]);

  console.log(`${(opponentReady)? "opponent ready" : "opponent not ready"}`)

  return (
    <section>
      <OpponentCard photo={opponent?.photo || ""} username={opponent?.username} deadPieces={playerDeadPieces} ready={opponentReady} gameStatus={gameStatus} oppTurn={!yourTurn}/>
      <div style={{height: "10px"}}></div>
      <Board
        board={board}
        side={side === "red" ? "r" : side === "black" ? "b" : ""}
        socket={socket}
        yourTurn={yourTurn}
        setYourTurn={setYourTurn}
      />
      <div style={{height: "10px"}}></div>
      <PlayerCard photo={profile?.photo || currentUser?.photoURL || ""} username={player?.username} deadPieces={oppDeadPieces} ready={playerReady} gameStatus={gameStatus} yourTurn={yourTurn} />
    </section>
  );
}
