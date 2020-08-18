"use strict";

const Message = require("../models/message");

const Router = require("express").Router;
const router = new Router();



// import middleware
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser } = require("../middleware/auth")

//authenticate user before every route
// app.use(authenticateJWT)

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
router.get("/id", ensureLoggedIn, async function(req, res, next){
    try{
        const message = await Message.get(id)

        return res.json({message})
    }catch(err){
        return next(err)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function(req, res, next){
    try{
        const {to_username, body} = req.body    
        const user  = res.locals.user

        const message = await Message.create({from_username: user.username, 
                                                to_username, 
                                                body})
        
        return res.json({message})                                                
    } catch(err){
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


module.exports = router;