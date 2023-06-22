//get container for our canvas
const banner = document.getElementById("banner");
const qna_box = document.getElementById("game-qna");
const input_qna = document.getElementById("input-qna");
const history_qna = document.getElementById("history-qna");
const spam_box = document.getElementById("game-spam");

//get socket which only uses websockets as a means of communication
const socket = io("/player",
  {
    transports: ["websocket"],
    autoConnect: false,

  }
);

const sessionID = sessionStorage.getItem("sessionID");
let playername = "";

if (sessionID) {
  playername = sessionStorage.getItem("playername");
  // console.log(playername, sessionID);
  socket.auth = { playername, sessionID };
  console.log(socket.auth);
  socket.connect();
}
else {
  input_qna.style.display = "flex";
  history_qna.style.display = "block";
  input_qna.focus();
  input_qna.addEventListener("keypress", onPlayerNameSelect);
}

function onPlayerNameSelect(event) {
  if (event.key != "Enter") return;
  playername = input_qna.value.toUpperCase();
  socket.auth = { playername };
  socket.connect();
}

socket.on("connect", () => {
  // save session datas
  socket.once("session", (sessionID) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { playername, sessionID };
    // store it in the sessionStorage
    sessionStorage.setItem("sessionID", sessionID);
    // store the playername in the sessionStorage
    sessionStorage.setItem("playername", playername);
  });

  // show playername and hide input box 
  banner.innerHTML = playername;
  banner.style.display = "flex";
  input_qna.style.display = "none";
  history_qna.style.display = "none";
  input_qna.value = "";
  input_qna.blur();

  socket.on("game-event", (gameStatus) => {
    //hide banner and invert colors
    banner.style.display = "none";


    switch (gameStatus) {
      case "vcnv":
        input_qna.style.display = "flex";
        history_qna.style.display = "block";
        input_qna.focus();
        spam_box.style.display = "flex";
        document.getElementById("unbloat").classList.add("minispam");
                
        onQna();
        onSpam();
        break;
      case "spam":
        // hide input box and show spam box
        input_qna.style.display = "none";
        history_qna.style.display = "none";
        input_qna.blur();
        spam_box.style.display = "flex";
        onSpam();
        break;
      case "qna":
        // hide spam box and show input box 
        spam_box.style.display = "none";
        input_qna.style.display = "flex";
        history_qna.style.display = "block";
        input_qna.focus();
        onQna();
        break;
      case "stop":
        spam_box.classList.remove("minispam");
        input_qna.value = "";
        input_qna.style.display = "none";
        history_qna.style.display = "none";
        document.getElementById("history-qna-1").innerHTML = "";
        document.getElementById("history-qna-2").innerHTML = "";
        document.getElementById("history-qna-3").innerHTML = "";
        input_qna.blur();
        spam_box.style.display = "none";
        banner.style.display = "flex";
        break;
      }
    });
});

function onSpam() {
  // spam mechanics
  let spammed = false;
  const spamming = (e) => {
    if (!spammed)
      socket.emit("player-update", "");
    spammed = true;
    document.getElementById("unbloat").style.fontSize = "30em";
    setTimeout(() => {
      document.getElementById("unbloat").style.fontSize = "15em";
    }, 48);
  }
  
  document.onkeydown = function (e) {
    if (
      (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) ||
      e.key === 'Meta' ||
      e.key === 'Shift' ||
      e.key === 'Control' ||
      e.key === 'alt'
    ) {
      return;
    }
    if (e.ctrlKey && e.key === 'Enter')
      spamming(e);
  };
  document.getElementById("unbloat").addEventListener("mousedown", spamming);

}

function onQna() {
  // submit the answer when enter key is pressed
  input_qna.addEventListener("keydown", (e) => {
    if (e.key == 'Enter' && input_qna.value != "") {
      socket.emit("player-update", input_qna.value.toUpperCase());
      for (let i = 1; i < 3; i++) {
        document.getElementById("history-qna-" + i).innerHTML = document.getElementById("history-qna-" + (i + 1)).innerHTML;
      }
      document.getElementById("history-qna-3").innerHTML = input_qna.value.toUpperCase();
      input_qna.value = "";
    }
  });
}

function onDisconnect() {
  input_qna.style.display = "none";
  spam_box.style.display = "none";
  history_qna.style.display = "none";
  input_qna.blur();
  banner.innerHTML = "Kết nối bị ngắt :(";
  banner.style.display = "flex";
}

socket.on("connect_error", onDisconnect);
socket.on("disconnect", onDisconnect);