const server_container = document.getElementById("server");

//get socket which only uses websockets as a means of communication
const socket = io("/host", { transports: ["websocket"] });

const players = {};

socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on("player-connected", (playerID, playername) => {
    players[playerID] = {
        name: playername,
        time: "----",
        ans: "------------",
        id: playerID,
        position: (players[playerID] === undefined ? Object.keys(players).length + 1 : players[playerID].position),
    }
    console.log(players[playerID].position);
    const playerNametag = document.getElementById("player-" + players[playerID].position + "-name");
    playerNametag.innerHTML = playername;

});

socket.on("player-update", (playerData) => {
    players[playerData.id].ans = playerData.ans;
    players[playerData.id].time = playerData.time;
    document.getElementById("player-" + players[playerData.id].position + "-time").innerHTML = players[playerData.id].time;
    document.getElementById("player-" + players[playerData.id].position + "-answer").innerHTML = players[playerData.id].ans;
    
});

socket.on("player-disconnected", (ID) => {
    if (ID === playerID) {
        delete players[ID];
        playerNametag.innerHTML = ":(";
    }
});

document.getElementById("startgame-spam").addEventListener("click", () => {
    socket.emit("game-event", "spam");
    Object.values(players).forEach((player) => {
        document.getElementById("player-" + players[player.id].position + "-time").innerHTML = "----";
        document.getElementById("player-" + players[player.id].position + "-answer").innerHTML = "--------------------";
    });
});
document.getElementById("startgame-qna").addEventListener("click", () => {
    socket.emit("game-event", "qna");
    Object.values(players).forEach((player) => {
        document.getElementById("player-" + players[player.id].position + "-time").innerHTML = "----";
        document.getElementById("player-" + players[player.id].position + "-answer").innerHTML = "--------------------";
    });
});
document.getElementById("stopgame").addEventListener("click", () => {
    socket.emit("game-event", "stop");
});
    
// prevent accidental closing of the host ui
if (socket.connected) 
    window.onbeforeunload = function (e) {
        e = e || window.event;

        // For IE and Firefox prior to version 3
        if (e) {
            e.returnValue = 'Sure?';
        }

        // For Safari
        return 'Sure?';
    };

