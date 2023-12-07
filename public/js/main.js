document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.querySelector(".chat-messages");
  const roomName = document.getElementById("room-name");
  const userList = document.getElementById("users");
  const fileInput = document.getElementById("fileInput");

  const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  const socket = io();

  function handleSendMessage(e) {
    e.preventDefault();

    let msg = e.target.elements.msg.value;
    msg = msg.trim();

    const file = fileInput.files[0];

    const data = {
      message: msg,
      file: !!file,
      content: file ? file : null,
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
    displayFileMessage(fileMessage);
  });

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes}`;
  }

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
    para.innerText = message.message;
    div.appendChild(para);
    chatMessages.appendChild(div);
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
        para.innerText = "File upload failed";
        div.appendChild(para);
      }
    }

    chatMessages.appendChild(div);
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
      console.error("Image URL not provided or invalid.");
      const para = document.createElement("p");
      para.classList.add("text");
      para.innerText = "File format not ";
      div.appendChild(para);
    }

    chatMessages.appendChild(div);
  }

  async function uploadFileAndGetDetails(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading file and getting details:", error);
      return null;
    }
  }

  const leaveGroupBtn = document.getElementById("leave-btn");
  leaveGroupBtn.addEventListener("click", () => {
    const leaveGroup = confirm("Are you sure you want to leave the group?");
    if (leaveGroup) {
      window.location.href = "/index.html";
    }
  });
});
function handleFileMessage(e) {
  e.preventDefault();

  let msg = e.target.elements.msg.value;
  msg = msg.trim();

  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("message", msg);
  if (file) {
    formData.append("file", file);
  }

  socket.emit("chatMessage", formData);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
}
