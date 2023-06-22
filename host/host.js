const server_container = document.getElementById("server");

//get socket which only uses websockets as a means of communication
const socket = io("/host", { transports: ["websocket"] });

const players = {};

let highlightedPlayer = 0;
let gameStatus = "stopped";

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


const playerUpdate = (playerData) => {
    console.log(playerData, gameStatus);
    if (gameStatus == "vcnv" && playerData.ans == "") {
        console.log("bell rung");
        socket.removeAllListeners("player-update");
        socket.emit("game-event", "stop");
        document.getElementById("player-" + players[playerData.id].position + "-answer").innerHTML = "CHUÔNG 🔔";
        return;
    }   
    if (highlightedPlayer == players[playerData.id].position) {
        document.getElementById("player-" + highlightedPlayer + "-answer").style.fontStyle = "normal";
        const minTimePlayer = Object.values(players).reduce((prev, curr) => prev.time < curr.time ? prev : curr);
        highlightedPlayer = minTimePlayer.position;       
    }
    if (highlightedPlayer == 0) {
        if (gameStatus == "spam") {
            socket.removeAllListeners("player-update");
            gameStatus = "stopped";
            setTimeout(() => {
                socket.emit("game-event", "stop");
                }, 1000);
            return;
        }

        else {
            highlightedPlayer = players[playerData.id].position;
        }
    }
    if (!highlightedPlayer)
        document.getElementById("player-" + highlightedPlayer + "-answer").style.fontStyle = "italic";

    players[playerData.id].ans = playerData.ans;
    players[playerData.id].time = playerData.time;
    document.getElementById("player-" + players[playerData.id].position + "-time").innerHTML = players[playerData.id].time;
    document.getElementById("player-" + players[playerData.id].position + "-answer").innerHTML = players[playerData.id].ans;
        
}

socket.on("player-update", playerUpdate);

socket.on("player-disconnected", (ID) => {
    if (players[ID]) {
        document.getElementById("player-" + players[ID].position + "-name").innerHTML = ":(";
        // delete players[ID];
    }
});

document.getElementById("startgame-spam").addEventListener("click", () => {
    socket.on("player-update", playerUpdate);
    socket.emit("game-event", "spam");
    Object.values(players).forEach((player) => {
        document.getElementById("player-" + players[player.id].position + "-time").innerHTML = "----";
        document.getElementById("player-" + players[player.id].position + "-answer").innerHTML = "";
    });
    highlightedPlayer = 0;
    gameStatus = "spam";
});
document.getElementById("startgame-qna").addEventListener("click", () => {
    gameStatus = "qna";
    socket.on("player-update", playerUpdate);
    socket.emit("game-event", "qna");
    Object.values(players).forEach((player) => {
        document.getElementById("player-" + players[player.id].position + "-time").innerHTML = "----";
        document.getElementById("player-" + players[player.id].position + "-answer").innerHTML = "--------------------";
    });
    if (highlightedPlayer != 0)
        document.getElementById("player-" + highlightedPlayer + "-answer").style.fontStyle = "normal";
    highlightedPlayer = 0;
});
document.getElementById("startgame-vcnv").addEventListener("click", () => {
    gameStatus = "vcnv";
    socket.on("player-update", playerUpdate);
    socket.emit("game-event", "vcnv");
    Object.values(players).forEach((player) => {
        document.getElementById("player-" + players[player.id].position + "-time").innerHTML = "----";
        document.getElementById("player-" + players[player.id].position + "-answer").innerHTML = "--------------------";
    });
    if (highlightedPlayer != 0)
        document.getElementById("player-" + highlightedPlayer + "-answer").style.fontStyle = "normal";
    highlightedPlayer = 0;
});
document.getElementById("stopgame").addEventListener("click", () => {
    console.log("stopgame");
    socket.removeAllListeners("player-update");
    socket.emit("game-event", "stop");
    gameStatus = "stopped";
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
    
    