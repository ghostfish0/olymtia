const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  transports: ["websocket"] //set to use websocket only
}); //this loads socket.io and connects it to the server.


const port = process.env.PORT || 8080;

//this next line makes sure we can put all our html/css/javascript in the public directory
app.use(express.static(__dirname + '/public'));
app.use('/host', express.static(__dirname + '/host'));
//we just have 1 route to the home page rendering an index html

app.get("/", (req, res) => {
  res.render("index.html");
});
app.get("/host", (req, res) => {
  res.render("index.html");
});

//run the server which uses express
http.listen(port, () => {
  console.log(`Server is active at port:${port}`);
});

const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

const randomId = () => require("crypto").randomBytes(8).toString("hex");

const players = {};
let startTime = new Date();

//Host socket configuration
io.of("/host").on("connection", (socket) => {
  console.log(`Host ${socket.id} connected`);

  socket.on("game-event", (gameStatus) => {
    if (gameStatus != "stop") {
      if (!gameInProgress)
        io.of("/player").emit("game-event", gameStatus);
      startTime = new Date(); // starts clock
    }
    else {
      io.of("/player").emit("game-event", "stop");
    }
  })
  
  socket.on("disconnect", () => {
    console.log(`Host ${socket.id} disconnected`);
  });
})

//Player authorization 
io.of("/player").use((socket, next) => {
  console.log("connection attempt");
  const playername = socket.handshake.auth.playername;
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.playername = session.playername;
      return next();
    }
  }

  if (Object.keys(players).length > 4) {
    console.log(`Player ${socket.id} tried to connect, room full!`);
    return next(new Error("room full")); // block the 5th and onward clients
  }
  
  if (!playername) {
    console.log(`Player ${socket.id} tried to connect, no valid username or session id!`);
    return next(new Error("invalid playername"));
  }
  socket.sessionID = randomId();
  socket.playername = playername;
  
  next();
});

// On successful player login
io.of("/player").on("connection", (socket) => {
  // Notifies everytime a player connects
  console.log(`Player ${socket.id} connected ${socket.playername}, ${socket.sessionID}`);
  
  const sessionID = socket.sessionID;

  socket.emit("session", sessionID);
  
  players[sessionID] = {
    name: socket.handshake.auth.playername,
    time: "",
    ans: "",
    id: sessionID,
  }

  io.of("/host").emit("player-connected", sessionID, players[sessionID].name);
  
  socket.on("player-update", (ans) => {
    players[sessionID].ans = ans;
    players[sessionID].time = (new Date() - startTime) / 1000;
    io.of("/host").emit("player-update", players[sessionID]);
  })
  
  socket.on("disconnect", () => {
    sessionStore.saveSession(socket.sessionID, {
      playername: socket.playername
    });   
    console.log(`Player ${sessionID} disconnected`);
    io.of("/host").emit("player-disconnected", sessionID);
  });
  
});
