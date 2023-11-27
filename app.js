const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
dotenv.config({
  path: "./.env",
});

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("database is connected");
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");

// Routes
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

// Socket.io integration
const server = http.createServer(app);
const io = socketIo(server);

require("./socket")(io, db); // Import and execute socket setup

// Start the server
server.listen(PORT, () => console.log(`💬 server on port ${PORT}`));
