const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", function (req, res, next) {
  res.render("webauthnLogin", { title: "WebAuthn Login" });
});

module.exports = router;
