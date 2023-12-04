const express = require("express");
const controller = require("../controllers/users");
const router = express.Router();
const path = require("path");

router.get(["/", "/login"], (req, res) => {
  if (req.user) {
    res.redirect("/home");
  } else {
    res.render("login");
  }
});

router.get("/register", (req, res) => {
  if (req.user) {
    res.redirect("/home");
  } else {
    res.render("register");
  }
});

router.get("/profile", controller.isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("profile", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

router.get("/home", controller.isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("home", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

router.get("/messages", controller.isLoggedIn, (req, res) => {
  if (req.user) {
    res.sendFile(path.join(__dirname, "../public/index.html"), {
      user: req.user,
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
