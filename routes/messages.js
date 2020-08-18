"use strict";

const Message = require("../models/message");

const Router = require("express").Router;
const router = new Router();

const {
	UnauthorizedError } = require("../expressError")

// import middleware
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth")


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
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
	try {
	
		const id = req.params.id;
		console.log('this is id', id)
		const message = await Message.get(id);
		
		const fromUser = message.from_user.username;
		const currentUser = res.locals.user.username;
		const toUser = message.to_user.username;

		//has to be user who sent or received 
		if (fromUser !== currentUser || toUser !== currentUser) {
			throw new UnauthorizedError("Not authorized to read this message")
		}

		return res.json({ message })
	} catch (err) {
		return next(err)
	}
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {

	try {
		const { to_username, body } = req.body
		const user = res.locals.user

		const message = await Message.create({
			from_username: user.username,
			to_username,
			body
		})

		return res.json({ message })
	} catch (err) {
		return next(err)
	}
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
	console.log('post /:id ran')
	try {
		const messageId = req.params.id;

		console.log("this is request.params", req.params)
		console.log("this is message id", await Message.get(messageId))

		const message = await Message.get(messageId)

		const currentUser = res.locals.user.username
		const toUser = message.to_user.username

		//check here if it's the correct user (there's nothing in req.params)
		if (toUser !== currentUser) {
			throw new UnauthorizedError(`Not the correct user`)
		}

		const messageRead = await Message.markRead(messageId)

		return res.json({ message: messageRead })

	} catch (err) {
		return next(err)
	}
})



module.exports = router;