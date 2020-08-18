"use strict";

const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();



// import middleware
const {
    authenticateJWT,
    ensureCorrectUser,
} = require("../middleware/auth");

const app = require("../app");

//authenticate user before every route
// app.use(authenticateJWT)

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function(req, res, next){
    try {
        const users = await User.all()
        
        return res.json({users})
    }catch(err){
        return next(err)
    }
    
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function(req, res, next){
    try{
        const user = await User.get(username)

        return res.json({user})

    }catch(err){
        return next(err)
    }
})



/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async function(req, res, next){
    try{
        const messageToUser = await User.messagesTo(username);
        
        return res.json({messages: messageToUser});

    }catch(err){
        return next(err);
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async function(req, res, next){
    try{
        const messagesFromUser = await User.messagesFrom(username);

        return res.json({messages: messagesFromUser});

    }catch(err){
        return next(err);
    }
})


module.exports = router;