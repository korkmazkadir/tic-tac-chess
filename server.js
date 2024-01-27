
//https://stackoverflow.com/a/52230661/2479643
//https://stackoverflow.com/a/38063557/2479643

const express  = require('express');
const http = require('http');
var serveStatic = require('serve-static');
const WebSocket = require('ws');
const url = require('url')

const hostname = '0.0.0.0';
const port = process.env.PORT || 5000;

console.log(`Root: ${__dirname}`)

var app = express();
app.use(serveStatic(__dirname + "/dist"));


const server = http.createServer(app)

const wss = new WebSocket.Server({ server:server });

const gameIdParameter = "game_id"
const guestParameter = "is_guest"

const gameMap = new Map();

const gameClientMap = new Map()

const errorGameIdUndefined = "game id undefined"
const errorGameNotExist = "game does not exist"


app.get('/games', function (req, res) {

  const gameIds = Array.from( gameMap.keys() )

  res.json( { games: gameIds });

});

wss.on('connection', function connection(ws, req) {

  const q = url.parse(req.url, true )
  const gameId = q.query[gameIdParameter]
  const isGuest = q.query[guestParameter]

  console.log(`[wss connecton request] game id : ${gameId}, is guest: ${isGuest}`)

  if(!gameId){
    console.log("closing connection, gameId not defined")
    ws.close(4001, errorGameIdUndefined)
    return
  }

  if(isGuest && !gameClientMap.has(gameId)){
    console.log("closing connection, game does not exist")
    ws.close(4002, errorGameNotExist)
    return
  }

  if(!gameClientMap.has(gameId)){
    gameClientMap.set(gameId, new Set())
  }

  gameClientMap.get(gameId).add(ws)

  ws.on('error', console.error);

  ws.on('message', function message(gameData) {
    
    gameMap.set(gameId, gameData)

    gameClientMap.get(gameId).forEach(webSocket => {
      if(webSocket != ws){
        webSocket.send(gameData)
      }
    });

  });

  // if there is an existing game, send the last state of the game
  if(gameMap.has(gameId)){
    console.log(`there is a game with id ${gameId}, sending game data`)
    ws.send(gameMap.get(gameId));
  }
  
});



/////////

server.listen({host:hostname, port: port},() => {
   console.log(`Server running at http://${hostname}:${port}/`);
});

