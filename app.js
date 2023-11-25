const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");

dotenv.config({
  path: "./.env",
});

const app = express();
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
// console.log(__dirname);
const location = path.join(__dirname, "./public");
app.use(express.static(location));
app.set("view engine", "hbs");

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
