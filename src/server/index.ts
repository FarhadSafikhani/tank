import { Server } from "colyseus";
import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";
import { monitor } from "@colyseus/monitor";
import cors from 'cors';
import { MyRoom } from "./rooms/MyRoom";
import { WebSocketTransport } from "@colyseus/ws-transport";
export const port = Number(process.env.PORT || 2567);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const app = express();

if (process.env.NODE_ENV === 'production') {
  //?
} else {
  app.use(cors());
}

const gameServer = new Server({
  greet: false,
  transport: new WebSocketTransport({
    //pingInterval: ...,
    //pingMaxRetries: ...,
    server: http.createServer(app),
    //verifyClient: ...
  })
});

// Serve static files with the .jpg extension from the "assets" directory
const assetsPath = path.join(__dirname, "../assets");
app.use(express.static(assetsPath, { extensions: ['*'] }));


// Serve static files from the "client" directory
const clientPath = path.join(__dirname, "../client/assets");
app.use(express.static(clientPath));


// add colyseus monitor
const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", auth, monitor());

gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`, 'Env:', process.env.NODE_ENV);


gameServer.define("room1", MyRoom);








