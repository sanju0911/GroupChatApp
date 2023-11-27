const moment = require("moment");
const controller = require("./controllers/users");

module.exports = (io, db) => {
  let socketsConnected = new Set();

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    socketsConnected.add(socket.id);
    io.emit("clients-total", socketsConnected.size);

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
      socketsConnected.delete(socket.id);
      io.emit("clients-total", socketsConnected.size);
    });

    socket.on("message", (data) => {
      // Store the message in the database
      storeMessageInDB(data);

      socket.broadcast.emit("chat-message", data);
    });

    socket.on("feedback", (data) => {
      socket.broadcast.emit("feedback", data);
    });
  });

  function storeMessageInDB(data) {
    const { name, message, dateTime } = data;

    const query = "INSERT INTO message (name, message, date) VALUES (?, ?, ?)";
    const values = [name, message, dateTime];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Error storing message in database:", err);
      } else {
        console.log("Message stored in database");
      }
    });
  }
};
