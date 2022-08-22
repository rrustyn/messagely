"use strict";

const bcrypt = require("bcrypt");
const { NotFoundError } = require("../expressError");
const db = require("../db");
const BCRYPT_WORK_FACTOR = 12;

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username,
                             password,
                             first_name,
                             last_name,
                             phone,
                             join_at,
                             last_login_at)
         VALUES
           ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
         RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];

  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (user) {
      return (await bcrypt.compare(password, user.password) === true);
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
          WHERE username = $1`,
      [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
      FROM users`
    );

    const users = results.rows;

    return users;
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
    const results = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
      FROM users
      WHERE username = $1`,
      [username]);

      const user = results.rows[0];

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

    const userMessages = await db.query(
              `SELECT m.id,
                  m.to_username,
                  m.body,
                  m.sent_at,
                  m.read_at,
                  u.username,
                  u.first_name,
                  u.last_name,
                  u.phone
              FROM messages AS m
              JOIN users AS u ON m.to_username = u.username
              WHERE from_username = $1`,
              [username]
              );

    let sentMessages = userMessages.rows.map(m => ({id: m.id,
                              to_user: {username: m.username,
                                        first_name: m.first_name,
                                        last_name: m.last_name,
                                        phone: m.phone},
                                body: m.body,
                                sent_at: m.sent_at,
                                read_at: m.read_at}

    ));

    return sentMessages;
  }


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const getMessages = await db.query(
              `SELECT m.id,
                  m.from_username,
                  m.body,
                  m.sent_at,
                  m.read_at,
                  u.username,
                  u.first_name,
                  u.last_name,
                  u.phone
              FROM messages AS m
              JOIN users AS u ON m.from_username = u.username
              WHERE to_username = $1`, [username]
    );

    let recievedMessages = getMessages.rows.map(m => ({id: m.id,
      from_user: {username: m.username,
                first_name: m.first_name,
                last_name: m.last_name,
                phone: m.phone},
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at}
    ));

  return recievedMessages;

  }
}


module.exports = User;
