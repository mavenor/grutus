const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const path = require("path");

router.get("/", function (req, res, next) {
  email = req.query.email;
  // generate a random challenge for webauthn
  challenge = crypto.randomBytes(32);
  credId = crypto.randomBytes(16);
  
  res.render("webauthn", { title: "WebAuthn", email: email, challenge: challenge.toString("base64"), credId: credId.toString("base64") });
});

module.exports = router;
