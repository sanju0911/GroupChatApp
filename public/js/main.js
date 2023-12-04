// main.js

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const fileInput = document.getElementById("fileInput");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Function to handle both text and file messages
function handleSendMessage(e) {
  e.preventDefault();

  let msg = e.target.elements.msg.value;
  msg = msg.trim();

  const file = fileInput.files[0];

  const data = {
    message: msg,
    file: !!file, // Indicate whether it's a file message
    content: file ? file : null, // Include the file content
  };

  socket.emit("chatMessage", data);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
}

chatForm.addEventListener("submit", handleSendMessage);

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("fileMessage", (fileMessage) => {
  // Handle file messages
  displayFileMessage(fileMessage);
});

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${hours}:${minutes}`;
}

// ... (other functions)

// Remove the duplicated welcome message
// socket.emit("message", formatMessage("ChatCord Bot", `Welcome to ${user.room}!`));

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.message; // Use 'message' property for text messages
  div.appendChild(para);
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
function displayMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);

  if (message.hasOwnProperty("message")) {
    const para = document.createElement("p");
    para.classList.add("text");
    para.innerText = message.message;
    div.appendChild(para);
  }

  if (message.hasOwnProperty("fileDetails")) {
    if (message.fileDetails.url) {
      const file = document.createElement("img");
      file.src = message.fileDetails.url;
      file.style.maxWidth = "400px";
      div.appendChild(file);
    } else {
      const para = document.createElement("p");
      para.classList.add("text");
      para.innerText = "File upload failed"; // Display a message for failed file uploads
      div.appendChild(para);
    }
  }

  document.querySelector(".chat-messages").appendChild(div);
}
function displayFileMessage(fileMessage) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = fileMessage.username;
  p.innerHTML += `<span>${fileMessage.time}</span>`;
  div.appendChild(p);

  if (fileMessage.fileDetails && fileMessage.fileDetails.url) {
    console.log("Image URL:", fileMessage.fileDetails.url);

    const file = document.createElement("img");
    file.onload = () => {
      console.log("Image loaded successfully.");
    };
    file.onerror = (error) => {
      console.error("Error loading image:", error);
    };

    file.src = fileMessage.fileDetails.url;
    file.style.maxWidth = "400px";
    div.appendChild(file);
  } else {
    const para = document.createElement("p");
    para.classList.add("text");
    para.innerText = "File upload failed"; // Display a message for failed file uploads
    div.appendChild(para);
  }

  document.querySelector(".chat-messages").appendChild(div);
}
