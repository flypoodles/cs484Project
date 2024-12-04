import { useState, useEffect } from "react";

import Board from "./Board";
import { Socket } from "socket.io-client";
import { User } from "../type";
import { fenToBoard } from "../utils/utils";

export default function BoardSection({
  board,
  setBoard,
  socket,
  player,
  playerReady,
  opponent,
  opponentReady,
  gameStatus,
  setGameStatus,
}: {
  board: string[][];
  setBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  socket: Socket;
  player: User;
  playerReady: boolean;
  opponent: User | null;
  opponentReady: boolean;
  gameStatus: boolean;
  setGameStatus: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // const [board, setBoard] = useState<string[][]>([]);
  const [side, setSide] = useState<string>("");
  const [turn, setTurn] = useState(0);
  const [yourTurn, setYourTurn] = useState(false);
  const [error, setError] = useState("");
  const [deadPieces, setDeadPieces] = useState(""); // NEWLY ADDED
  const [isCheck, setCheck] = useState(false); // NEWLY ADDED
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
          setDeadPieces(deadPieces); // NEWLY ADDED
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
          setDeadPieces(deadPieces);
          const newBoard = fenToBoard(boardFenNew);
          setBoard(newBoard.board);
          alert(`winner : ${winner}`);
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

  return (
    <section>
      <div>Turn: {turn}</div>
      <div style={!yourTurn ? { fontWeight: "bold" } : {}}>
        Opponent: {opponent?.username}{" "}
        {opponentReady && !gameStatus ? "(ready)" : ""}{" "}
      </div>
      <Board
        board={board}
        side={side === "red" ? "r" : side === "black" ? "b" : ""}
        socket={socket}
        yourTurn={yourTurn}
        setYourTurn={setYourTurn}
      />
      <div style={yourTurn ? { fontWeight: "bold" } : {}}>
        You: {player.username} {playerReady && !gameStatus ? "(ready)" : ""}
      </div>
      {error !== "" && <div>{error}</div>}
      {deadPieces !== "" && <div>{deadPieces}</div>}
      {isCheck && <div>checked: {isCheck}</div>}
    </section>
  );
}
