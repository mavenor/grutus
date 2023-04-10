const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(path.join(__dirname, "../db/users.db"));

router.get("/", function (req, res, next) {
  db.get("SELECT id FROM users WHERE email = ?", [req.query.email], function (err, row) {
    if (err) {
      console.error(err.message);
      res.status(404).send("Error retrieving user!: " + err.message);
      return;
    }
    if (row) {
      console.log("User found!");
      credId = row.id;
      res.render("webauthnLogin", { title: "WebAuthn Login", credId: credId });
      
    }
  });
});

module.exports = router;
