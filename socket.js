// socket.js
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

module.exports = (io, db) => {
  io.on("connection", (socket) => {
    console.log(io.of("/").adapter);

    socket.on("joinRoom", async ({ username, room }) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      socket.emit(
        "message",
        formatMessage("ChatCord Bot", "Welcome to ChatCord!")
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

      try {
        const result = await db.query(
          "SELECT * FROM message WHERE room = ? ORDER BY date DESC LIMIT 5",
          [user.room]
        );

        console.log("Fetched messages from the database:", result);

        if (Array.isArray(result) && result.length > 0) {
          const messages = result.map((message) =>
            formatMessage(message.name, message.message)
          );
          messages.reverse();
          messages.forEach((message) => {
            socket.emit("message", message);
          });
        }
      } catch (error) {
        console.error("Error fetching messages from the database:", error);
      }
    });

    socket.on("chatMessage", async (msg) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit("message", formatMessage(user.username, msg));

      const messageData = {
        room: user.room,
        name: user.username,
        message: msg,
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      try {
        await db.query("INSERT INTO message SET ?", messageData);
        console.log("Message stored in the database");
      } catch (error) {
        console.error("Error storing message in the database:", error);
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
