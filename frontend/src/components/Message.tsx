import { User, Message } from "../type.ts";
import React, { ReactNode, useState } from "react";
import { Socket } from "socket.io-client";
interface MessageProp {
  user: User;
  opponent: User;
  socket: Socket;
}

const Chat: React.FC<MessageProp> = ({
  user,
  opponent,
  socket,
}: MessageProp) => {
  const [curMessage, setCurmessage] = useState<string>("");

  const [messageLog, setMessageLog] = useState<Message[]>([]);
  const renderList = () => {
    const components: ReactNode = messageLog.map((message) => (
      <li>
        {message.sender.username} : {message.message}
      </li>
    ));
    return components;
  };

  const handleSubmit = () => {
    alert(curMessage);
    const newMessage: Message = { sender: user, message: curMessage };
    // Todo: socket emit
    setMessageLog(messageLog.concat(newMessage));
    setCurmessage("");
  };

  // Todo : Receive message using socket on

  return (
    <>
      <ol>{renderList()}</ol>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={curMessage}
          placeholder="Enter room number"
          onChange={(e) => setCurmessage(e.target.value)}
          required
        />
        <button type="submit">Sent</button>
      </form>
    </>
  );
};

export default Chat;
