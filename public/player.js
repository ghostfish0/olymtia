//get container for our canvas
const welcome = document.getElementById("welcome");
const input_container = document.getElementById("input-container");
const answer_box = document.getElementById("answer-box");
const spam_box = document.getElementById("game-spam");

//get socket which only uses websockets as a means of communication
const socket = io("/player", { transports: ["websocket"] });

socket.on("connect", () => {
  welcome.innerHTML = socket.id;
});

socket.on("login", (data) => {
  loginPlayer(data);
});

socket.on("disconnect", () => {
  console.log("disconnect");
  input_container.style.display = "none";
  document.getElementById("player-name").style.display = "none";
  welcome.innerHTML = "Kết nối đã bị ngắt :(";
  welcome.style.display = "flex";
});

function loginPlayer(data) {
  welcome.style.display = "none";
  input_container.style.display = "flex";
  document.getElementById("player-name").innerHTML = data;
  document.getElementById("player-name").style.display = "block";
  
  socket.on("game-event", (gameStatus) => {
    switch(gameStatus) {
      case "spam":
        console.log("spam!");
        let spammed = false;
        answer_box.style.display = "none";
        document.getElementById("player-name").style.display = "none";
        spam_box.style.display = "flex";
        document.getElementById("unbloat").addEventListener("click", (e) => {
          if (!spammed)
            socket.emit("updateSpam");
          spammed = true;
          document.getElementById("bloated").style.visibility = "visible";
          setTimeout(() => {
            document.getElementById("bloated").style.visibility = "hidden";
          }, 100);
        });
        break;
      case "qna":
        console.log("qna");
        answer_box.style.display = "flex";
        document.getElementById("player-name").style.display = "none";
        spam_box.style.display = "none";
        answer_box.focus();

        answer_box.addEventListener("keydown", (e) => {
          if (e.key == 'Enter' && answer_box.value != "") {
            console.log("submited", answer_box.value);
            socket.emit("updateQnA", answer_box.value);
            answer_box.value = "";
          }
        });
        break;
      case "stop":
        answer_box.value = "";
        answer_box.style.display = "none";
        answer_box.blur();
        spam_box.style.display = "none";
        document.getElementById("player-name").style.display = "flex";
      
        break;
    }
  });
  
}