"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");



/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function(req, res, next){
  const message = await Message.get(req.params.id);
  const username = res.locals.user.username;

  if(username === message.from_user ||
     username === message.from_user){
        return res.json(message);
     }

     //TODO? Should we throw an error
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function(req,res){
  const username = res.locals.user.username;
  const r = req.body;
  return res.json(await Message.create(username, r.to_username, r.body));
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",ensureLoggedIn, async function(req,res){
  const username = res.locals.user.username;
  const message = await Message.get(req.params.id);
  if(username === message.to_username){
    return res.json(await Message.markRead(req.params.id));
  }
});


module.exports = router;