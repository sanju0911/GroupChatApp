// socket.js
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

      // Emit the welcome message to the user who joined
      socket.emit(
        "message",
        formatMessage("ChatCord Bot", `Welcome to ${user.room}!`)
      );

      // Broadcast the join message to all users in the room
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage("ChatCord Bot", `${user.username} has joined the chat`)
        );

      // Emit the updated user list to all users in the room
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
          // Handle file upload logic here
          // You may want to save the file to the server, generate a unique filename, etc.
          // Then broadcast a message with the file details to all users in the room
          io.to(user.room).emit("fileMessage", {
            username: user.username,
            time: getCurrentTime(),
            fileDetails: {
              url: "example-url", // Replace with the actual property for file URL
            },
          });
        } else if (message) {
          const messageData = {
            room: user.room,
            name: user.username,
            message: message,
            date: new Date().toISOString().slice(0, 19).replace("T", " "),
          };

          try {
            // Store the text message in the database
            await db.query("INSERT INTO message SET ?", messageData);
            console.log("Text message stored in the database");

            // Broadcast the text message to all users in the room
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
