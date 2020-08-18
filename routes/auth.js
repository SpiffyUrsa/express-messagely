"use strict";

const Router = require("express").Router;
const router = new Router();

const bcrypt = require("bcrypt")

// import 
const db = require("../db")

// import jwt
const jwt = require("jsonwebtoken")

// import error 

const { UnauthorizedError } = require("../expressError")

//import secret_key
const { SECRET_KEY } = require("../config");
const User = require("../models/user");


/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
	try {
		const { username, password } = req.body;

		const user = await User.authenticate(username, password)
		console.log('this is user', user, "username", username)

		if (user) {
			User.updateLoginTimestamp(username)
			let token = jwt.sign({ username }, SECRET_KEY);
			return res.json({ token });

		} else {
			throw new UnauthorizedError("Invalid user/password");
		}


	} catch (err) {
		return next(err);
	}
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res, next) {

	try {
		const { username } = await User.register(req.body)

		//don't need to await bc below lines don't depend on this finishing
		User.updateLoginTimestamp(username)

		let token = jwt.sign({ username }, SECRET_KEY)

		return res.json({ token })

	} catch (err) {
		return next(err)
	}

})


module.exports = router;
