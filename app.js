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

const answers = {};
let adminID = "";

//Host socket configuration
io.of("/host").on("connection", (socket) => {
  console.log(`Host ${socket.id} connected`);
  adminID = socket.id;

  // On receiving the player's name from the host UI, login that player
  socket.on("login", (playerName, playerSocketID) => {
    io.of("/player").to(playerSocketID).emit("login", playerName);
  })
  
  socket.on("disconnect", () => {
    console.log(`Host ${socket.id} disconnected`);
  });
})

//Player socket configuration
io.of("player").on("connection", (socket) => {
  // Everytime a player connects, print a notification
  
  if (io.engine.clientsCount > 5) {
    socket.disconnect(); // disconnect the 5th and onward clients
    console.log(`Client tried to ${socket.id} connect`);
    return;
  }
  console.log(`Client ${socket.id} connected`);

  io.of("/host").emit("player-connected", socket.id);
  
  answers[socket.id] = "";
  
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`);
    io.of("/host").emit("player-disconnected", socket.id);
  });
  
});
