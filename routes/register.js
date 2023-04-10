const express = require("express");
const router = express.Router();
const path = require("path");
// use SQLite3 to store the user's email and webauthn id
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(path.join(__dirname, "../db/users.db"));


router.get("/", function (req, res, next) {
  res.render("register", { title: "Register" });
});

router.post("/", function (req, res, next) {
  // get email, id (webauthn) from request, and store in database
  email = req.body.email;
  id = req.body.id;
  db.run("INSERT INTO users (email, id) VALUES (?, ?)", [email, id], function (err) {
    if (err) {
      // use morgan to log the error
      console.error(err.message);
      res.status(500).send("Error registering user!: " + err.message);
      return;
    }
    res.status(200).send("User registered successfully!");
  });
});

module.exports = router;
