import { User, Message, RoomInfo } from "../../type.ts";
import React, { ReactNode, useState } from "react";
import { Socket } from "socket.io-client";
import "./styles/Chat.css"

interface MessageProp {
  user: User;
  opponent: User | null;
  socket: Socket;
  room: RoomInfo;
}

const Chat: React.FC<MessageProp> = ({
  user,
  opponent,
  socket,
  room,
}: MessageProp) => {
  const [curMessage, setCurmessage] = useState<string>("");

  const [messageLog, setMessageLog] = useState<Message[]>([]);

  // render all the chat messages
  const renderList = () => {
    const components: ReactNode = messageLog.map((message, i) => (
      <li key={i}>
        {message.sender.username} : {message.message}
      </li>
    ));
    return components;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMessage: Message = { sender: user, message: curMessage };
    socket.emit("chat message", room.roomNumber, newMessage);

    setCurmessage("");
  };

  socket.on("chat message", (message: Message) => {
    setMessageLog(messageLog.concat(message));
  });

  return (
    <section className="game-room-chat">
      <h1>Chat with {opponent?.username}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={curMessage}
          placeholder="type message"
          onChange={(e) => setCurmessage(e.target.value)}
          required
        />
        <button disabled={!opponent} type="submit">Sent</button>
      </form>
      <ol>{renderList()}</ol>
    </section>
  );
};

export default Chat;
