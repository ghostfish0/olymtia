const server_container = document.getElementById("server");

//get socket which only uses websockets as a means of communication
const socket = io("/host", { transports: ["websocket"] });

const server_input_box = document.getElementById("server-input-box");

const players = {};

socket.on("player-connected", (playerID) => {
    
    players[playerID] = {
        name: "",
        time: Infinity,
        ans: "",
        id: playerID,
    }
    const playerNametag = document.getElementById("player-" + Object.keys(players).length + "-name");
    playerNametag.innerHTML = playerID;

    playerNametag.addEventListener("dblclick", (e) => {
        showInputBox();
        // process the input on enter key
        server_input_box.addEventListener("keydown", (e) => { processPlayerName(e, playerNametag, playerID); });
    });
    
    socket.on("player-disconnected", (ID) => {
        if (ID === playerID) {
            delete players[ID];
            playerNametag.style.backgroundColor = "red";
        }
    });

    socket.on("player-update", (playerData) => {
        console.log("received data");
        players[playerData.id] = playerData;
        const playersList = Object.values(players);
        playersList.sort((a, b) => (a.time > b.time) ? 1 : -1);
        
        
        for(let i = 0; i < playersList.length; i++) {
            if (playersList[i].time == Infinity)
                playersList[i].time = "▓▓▓▓"
        }
        for(let i = 0; i < playersList.length; i++) {
            document.getElementById("player-" + (i+1) + "-name").innerHTML = playersList[i].name;
            document.getElementById("player-" + (i+1) + "-time").innerHTML = playersList[i].time;
            document.getElementById("player-" + (i+1) + "-answer").innerHTML = playersList[i].ans;
        }
    });
});


function processPlayerName(e, playerNametag, playerID) {
    if (e.key == 'Escape') {
        console.log('let me out!');
        hideInputBox();
        return;
    }
    if (e.key === "Enter" && playerNametag.innerHTML.length == 20 && server_input_box.value != "") {
        playerNametag.innerHTML = server_input_box.value;
        players[playerID].name = server_input_box.value;
        socket.emit("login", server_input_box.value, playerID);
    
        hideInputBox();
    }
}

function showInputBox() {
    // hide the other control elements
    document.getElementById("startgame-qna").style.display = "none";
    document.getElementById("startgame-spam").style.display = "none";
    document.getElementById("stopgame").style.display = "none";
    // show the input field
    server_input_box.style.display = "flex";
    server_input_box.focus();

}

function hideInputBox() {
    // revert the ui changes
    server_input_box.style.display = "none";
    server_input_box.value = "";
    server_input_box.blur();
    document.getElementById("startgame-qna").style.display = "flex";
    document.getElementById("startgame-spam").style.display = "flex";
    document.getElementById("stopgame").style.display = "flex";
    
}

document.getElementById("startgame-spam").addEventListener("click", () => {
    socket.emit("game-event", "spam");
    for(let i = 1; i <= 4; i++)
        document.getElementById("player-" + i + "-answer").innerHTML = "";
    gameStartedUI();
});
document.getElementById("startgame-qna").addEventListener("click", () => {
    socket.emit("game-event", "qna");
    gameStartedUI();
});
document.getElementById("stopgame").addEventListener("click", () => {
    socket.emit("game-event", "stop");
    gameStartedUI();
});

function gameStartedUI() {
    
}

// prevent accidental closing of the host ui
window.onbeforeunload = function (e) {
    e = e || window.event;

    // For IE and Firefox prior to version 3
    if (e) {
        e.returnValue = 'Sure?';
    }

    // For Safari
    return 'Sure?';
};


