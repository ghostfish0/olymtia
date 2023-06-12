const server_container = document.getElementById("server");

//get socket which only uses websockets as a means of communication
const socket = io("/host", { transports: ["websocket"] });

const server_input_box = document.getElementById("server-input-box");

let playersID = [];

socket.on("player-connected", (playerSocketID) => {
    playersID.push(playerSocketID);
    const playerNametag = document.getElementById("player-" + playersID.length + "-name");
    playerNametag.innerHTML = playerSocketID;

    playerNametag.addEventListener("dblclick", (e) => {
        // hide the other control elements
        document.getElementById("startgame-answers").style.display = "none";
        document.getElementById("startgame-spam").style.display = "none";
        document.getElementById("stopgame").style.display = "none";
        // show the input field
        server_input_box.style.display = "flex";
        server_input_box.focus();

        // intepret the value from the input field
        server_input_box.addEventListener("keyup", (e) => {
            if (e.key == 'Enter' && playerNametag.innerHTML.length == 20) {
                playerNametag.innerHTML = server_input_box.value;
                socket.emit("login", server_input_box.value, playersID[playerNametag.id.substr(7,1) - 1]);

                // revert the ui changes
                server_input_box.style.display = "none";
                server_input_box.value = "";
                server_input_box.blur();
                document.getElementById("startgame-answers").style.display = "flex";
                document.getElementById("startgame-spam").style.display = "flex";
                document.getElementById("stopgame").style.display = "flex";
            }
        });
    });

    socket.once("player-disconnected", (playerSocketID) => {
        playersID.splice(playersID.indexOf(playerSocketID), 1);
    })
}); 

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


