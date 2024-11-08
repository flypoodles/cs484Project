import React, { FC } from "react";

interface Props {
  // Define your component's props here
  username: String;

  

=
}

const Welcome: FC<Props> = ({ user }) => {
  return (
    <div>
      <form onSubmit={handleConnection}>
        <label htmlFor="productId"></label>
        <input
          type="text"
          value={user.getUserName}
          placeholder="Enter userName"
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <button type="submit">Connect</button>
      </form>
    </div>
  );
};

export default Welcome;
