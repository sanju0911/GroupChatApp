const express = require("express");
const controller = require("../controllers/users");
const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/logout", controller.logout);
module.exports = router;
