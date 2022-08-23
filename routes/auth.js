"use strict";

const Router = require("express").Router;
const router = new Router();
const db = require("../db");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res) {
  const { username, password } = req.body;
  
  if (await User.authenticate(username, password)) {
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
  const user = await User.register(req.body);
  
  const token = jwt.sign({ username: user.username }, SECRET_KEY);
  return res.json({ token });
});



module.exports = router;