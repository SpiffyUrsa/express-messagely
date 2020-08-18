"use strict";
const { BCRYPT_WORK_FACTOR } = require("../config");
const { NotFoundError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    let hashPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
      INSERT INTO users (username, 
                          password, 
                          first_name, 
                          last_name, 
                          phone, 
                          join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, password, first_name, last_name, phone, join_at
    `, [username, hashPwd, first_name, last_name, phone]);
    
    const user = result.rows[0];
    return user;
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(`
      SELECT password 
      FROM users 
      WHERE username = $1 
    `, [username]);

    const userData = result.rows[0];

    if (userData === undefined) {
      throw new UnauthorizedError("Invalid user/password");
    }
    
    return await bcrypt.compare(password, userData.password) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(`
      UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at
      `, [username]);

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`The user ${username} does not exist.`);

    return user;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {

    const result = await db.query(`
      SELECT username, first_name, last_name
      FROM users
    `);

    const allUsers = result.rows;

    return allUsers;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1
    `, [username]);

    let user = result.rows[0];

    if (!user) throw new NotFoundError(`The user ${username} does not exist.`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const results = await db.query(`
        SELECT m.id, 
              m.body, 
              m.sent_at, 
              m.read_at, 
              m.to_username, 
              u.username, 
              u.first_name, 
              u.last_name, 
              u.phone
        FROM messages AS m
        JOIN users AS u ON m.to_username = u.username
        WHERE m.from_username = $1
      `, [username]);

    let msgsFromUser = results.rows;

    return msgsFromUser.map(msg => ({
      id: msg.id,
      to_user: {
        username: msg.username,
        first_name: msg.first_name,
        last_name: msg.last_name,
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at,
    }));

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const results = await db.query(`
      SELECT m.id, 
            m.from_username,
            u.username,  
            u.first_name, 
            u.last_name, 
            u.phone, 
            m.body, 
            m.sent_at, 
            m.read_at
      FROM messages AS m 
      JOIN users AS u ON m.from_username = u.username
      WHERE m.to_username = $1
    `, [username]);

    let msgsToUser = results.rows;

    return msgsToUser.map(msg => ({
      id: msg.id,
      from_user: {
        username: msg.username,
        first_name: msg.first_name,
        last_name: msg.last_name,
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at,
    }));
  }
}

// PLUGIN that allows you to select two blocks of text and show differences. CHECK IT OUT
// ^ SIDEBYSIDE DIFF or something like that

module.exports = User;
