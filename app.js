const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

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

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
app.use(upload.single("file")); 
app.use("/uploads", express.static("uploads"));


app.post("/upload", (req, res) => {
  console.log("Received file:", req.file); 
  if (req.file) {
    const { originalname, filename, path } = req.file;
    res.json({ originalname, filename, path });
  } else {
    res.status(400).json({ error: "No file received" });
  }
});

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

const server = http.createServer(app);
const io = socketIo(server);

const socketSetup = require("./socket");
socketSetup(io, db);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
