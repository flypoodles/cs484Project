# CS 484 Project - Chinese Chess

### Creator: Manh Phan, Lei Chen

---

### Prequisite: To build our project, you need firestore api keys.

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
     - Click the "Create Room" button in the lobby.
     - The player will enter a new game room.
     - Each game room is assigned a unique room number, which the creator can share with others to join.
     - The game will only start when two players are in the room and both press the "Ready" button.
3. **Inside the Game Room:**
   - The game board is displayed on the left.
   - The game information section is located at the top right.
   - The chat box is located at the bottom right.
   - Players can communicate using the chat feature.
4. **During the Game:**
   - Each piece moves according to its specific rules in Chinese Chess.
   - Captured pieces are moved to the “graveyard” area next to each player’s profile.
   - If a king is in danger of being captured, a red
     “Checked” warning will appear in the game information section.
   - The game ends when a player captures the opponent's king.
   - Players can press "Ready" again to start a new game.
5. **Login Session**
   - If a player opens another tab with the same authentication, the website will create a new socket for that user.
   - If a player signs out in one tab, they will also be signed out in other tabs because the same authentication is shared.
   - This feature is allowed so users can play with each other using the same account.
