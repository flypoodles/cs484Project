import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
// "http://localhost:3000";
const URL = import.meta.env.VITE_SERVER_URL;
console.log(URL);
export const socket = io(URL, {
  autoConnect: false,
});
