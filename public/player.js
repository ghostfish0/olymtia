//get container for our canvas
const welcome = document.getElementById("welcome");
const input_container = document.getElementById("input-container");
const answer_box = document.getElementById("answer-box");

//get socket which only uses websockets as a means of communication
const socket = io("/player", { transports: ["websocket"] });

socket.on("connect", () => {
  welcome.innerHTML = socket.id;
});

socket.once("login", (data) => {
  handlePlayer(data);
});

socket.on("disconnect", () => {
  console.log("disconnect");
  input_container.style.display = "none";
  welcome.innerHTML = "🍩";
  welcome.style.display = "flex";
});

function handlePlayer(data) {
  console.log(data);
  welcome.style.display = "none";
  document.getElementById("player-name").innerHTML = data;
  document.getElementById("player-name").style.display = "block";

  input_container.style.display = "flex";
  
  socket.on("game", (status) => {
    if (status == "spam") {
      socket.emit("updateAnswer", "spam");
      answer_box.style.display = "none";
      document.getElementById("bloated").style.visibility = "visible";
      document.getElementById("bloated").addEventListener("click", (e) => {
        setTimeout(() => {
          document.getElementById("bloated").style.visibility = "hidden";
        }, 100);
      });
    }
    else if (status == "answers") {
      answer_box.style.dipslay = "flex";
      answer_box.focus();
      answer_box.addEventListener("keydown", (e) => {
        if (e.key == 'Enter')
          socket.emit("updateAnswer", answer_box.value);
        
      });
    }
    else if (status == "stop"){
      answer_box.value = "";
      answer_box.style.display = "none";
      answer_box.blur();
    }
  })
  
}