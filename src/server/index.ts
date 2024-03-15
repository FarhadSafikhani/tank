import { Server } from "colyseus";
import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";
import { monitor } from "@colyseus/monitor";
import cors from 'cors';
import { RoomBase } from "./rooms/sv_room_base";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { RoomTest } from "./rooms/sv_room_test";
import { RoomBR } from "./rooms/sv_room_br";
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

app.use('/favicon.ico', express.static(__dirname + '../client/assets/favicon.ico'));

// Serve static files with the .jpg extension from the "assets" directory
const assetsPath = path.join(__dirname, "../assets");
app.use(express.static(assetsPath, { extensions: ['*'] }));


// Serve static files from the "client" directory
const clientPath = path.join(__dirname, "../client/assets");
app.use(express.static(clientPath));

// Serve JS files
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath, { extensions: ['js'] }));

// Serve the client/index.html file
const indexPath = path.join(__dirname, "../../dist/index.html");
app.get("/", (req, res) => {
  res.sendFile(indexPath);
});


// add colyseus monitor
const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", auth, monitor());

gameServer.listen(port);

gameServer.define("roomBR", RoomBR);
gameServer.define("roomTest", RoomTest);

console.log(`Listening on Port: ${port}`, 'Env:', process.env.NODE_ENV);








