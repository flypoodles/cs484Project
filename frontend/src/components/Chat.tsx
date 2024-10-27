import { User, Message, RoomInfo } from "../type.ts";
import React, { ReactNode, useState } from "react";
import { Socket } from "socket.io-client";

interface MessageProp {
  user: User;
  opponent: User;
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
    const components: ReactNode = messageLog.map((message) => (
      <li>
        {message.sender.username} : {message.message}
      </li>
    ));
    return components;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(curMessage);
    const newMessage: Message = { sender: user, message: curMessage };
    socket.emit("chat message", room.roomNumber, newMessage);

    setCurmessage("");
  };

  socket.on("chat message", (message: Message) => {
    setMessageLog(messageLog.concat(message));
  });

  return (
    <>
      <h1>Chat with {opponent.username}</h1>
      <ol>{renderList()}</ol>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={curMessage}
          placeholder="type message"
          onChange={(e) => setCurmessage(e.target.value)}
          required
        />
        <button type="submit">Sent</button>
      </form>
    </>
  );
};

export default Chat;
