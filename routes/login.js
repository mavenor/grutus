const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", function (req, res, next) {
  // get the user's webauthn id from the sqlite database
  res.render("login", { title: "WebAuthn Login" });
});

module.exports = router;
