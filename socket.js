const formatMessage = require("./utils/messages");
const getCurrentTime = require("./utils/time");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

module.exports = (io, db) => {
  io.on("connection", (socket) => {
    console.log(io.of("/").adapter);

    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      socket.emit(
        "message",
        formatMessage("ChatCord Bot", `Welcome to ${user.room}!`)
      );

      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage("ChatCord Bot", `${user.username} has joined the chat`)
        );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });

    socket.on("chatMessage", async (data) => {
      const user = getCurrentUser(socket.id);

      if (user) {
        const { message, file } = data;

        if (file) {
          const fileDetails = await uploadFileAndGetDetails(file);

          io.to(user.room).emit("fileMessage", {
            username: user.username,
            time: getCurrentTime(),
            fileDetails,
          });
        } else if (message) {
          const messageData = {
            room: user.room,
            name: user.username,
            message: message,
            date: new Date().toISOString().slice(0, 19).replace("T", " "),
          };

          try {
            await db.query("INSERT INTO message SET ?", messageData);
            console.log("Text message stored in the database");

            io.to(user.room).emit("message", {
              ...formatMessage(user.username, message),
              time: getCurrentTime(),
            });
          } catch (error) {
            console.error("Error storing text message in the database:", error);
          }
        }
      }
    });

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

    socket.on("disconnect", () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage("ChatCord Bot", `${user.username} has left the chat`)
        );

        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
};
