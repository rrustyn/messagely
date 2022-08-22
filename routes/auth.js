"use strict";

const Router = require("express").Router;
const router = new Router();
const db = require("../db");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res) {
  const { username, password } = req.body;

  if (User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }

  throw new UnauthorizedError("Invalid user/password");
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res) {
  const { username, password, first_name, last_name, phone } = req.body;
  
  User.register(username, password, first_name, last_name, phone);
  
  const token = jwt.sign({ username }, SECRET_KEY);
  return res.json({ token });
});



module.exports = router;