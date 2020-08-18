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
const { SECRET_KEY} = require("../config");
const User = require("../models/user");


/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        const result = await db.query(
            `SELECT password
            FROM users
            WHERE username = $1
            `, [username]
        )

        let user = result.rows[0];
        //console.log('this is user', user)
        //console.log("username", username)

        if (user) {
            if (await bcrypt.compare(password, user.password) === true) {
                let token = jwt.sign({ username }, SECRET_KEY);
                return res.json({ token });
            }
            //Need to handle it doesn't call res.json, or go to next(err)
            throw new UnauthorizedError("Invalid user/password");
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
router.post("/register", async function(req, res, next){

    try {
    const { username } = await User.register(req.body)

    let token = jwt.sign({username}, SECRET_KEY)

    return res.json({token})

    } catch(err){
        return next(err)
    }

})


module.exports = router;