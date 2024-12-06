# CS 484 Project - Chinese Chess

### Creator: Manh Phan, Lei Chen

---

### To run backend

```
    npm install
    npm install -g tsx
    npm run start
```

### To run frontend

```
    npm install
    npm run dev
```

---

### Technologies Used:

- **Socket.io**: Enables bidirectional communication,
  allowing the game state to update simultaneously for both players.
- **Google Firebase**: Facilitates single sign-on (SSO) and user registration.
- **React**:Used for the frontend.
- **Node.js**: Used for the backend.
- **Typescript**: Used for both frontend and backend;

---

### Guide to Moving Pieces:

> Learn how to move each piece [here](https://www.xiangqi.com/help/pieces-and-moves):

---

### Features:

1. **User Login and Registration**
    - Players can log in using their Google account or register with their email address.
2. **Creating and Joining Rooms**
    - After logging in, players can either create a room or join an existing one.
    - **Options to Join a Room:**
        - Join randomly if a room has already been created by another player.
        - Join by entering a specific room number.
    - **To Create a Room:**
        - 