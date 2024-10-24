import { User } from "../type.ts";
import React, { ReactNode } from "react";

interface userListProp {
  users: User[];
}

const UserList: React.FC<userListProp> = ({ users }: userListProp) => {
  const renderList = (users: User[]) => {
    const components: ReactNode = users.map((user) => (
      <li>
        {user.id} {user.username}
      </li>
    ));

    return components;
  };

  return (
    <>
      <ol>{renderList(users)}</ol>
    </>
  );
};

export default UserList;
