const errorMessage = require('../errorMessage.js')
const db = require('../models')
const bcrypt = require('bcrypt')
const saltRounds = 11

const User = db.User

const userController = {
  login: async (req, res) => {
    const { username, password } = req.body
    let user
    try {
      user = await User.findOne({
        where: {
          username,
        },
      })
    } catch (err) {
      res.json(errorMessage.userNotFound)
      console.log(err)
      return
    }
    if (!user) return res.json(res.json(errorMessage.userNotFound))
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) return res.json(res.json(errorMessage.userNotFound))
      if (result) {
        req.session.user = username
        req.session.userId = user.id
        res.json({
          ok: 1,
          message: 'success',
        })
        return
      }
      res.json(res.json(errorMessage.userNotFound))
    })
  },
  logout: async (req, res) => {
    await req.session.destroy(err => {
      if (err) return res.json(errorMessage.general)
    })
    res.json({
      ok: 1,
      message: 'session destroyed',
    })
  },
  register: async (req, res) => {
    const { username, email, password, checkedPassword } = req.body
    let result
    if (password !== checkedPassword) {
      return res.json(errorMessage.passwordNotSame)
    }
    const usernameRe = /^[\w!"#$%()*+,-\/;<=>?@[\]^`_{|}~]{4,32}$/g
    if (!usernameRe.test(username)) return res.json(errorMessage.usernameError)
    const passwordRe = /^[^ ]{6,64}$/g
    if (!passwordRe.test(password)) return res.json(errorMessage.passwordError)
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) return res.json(errorMessage.general)
      try {
        result = await User.create({
          username,
          password: hash,
          email,
          nickname: username,
        })
      } catch (err) {
        res.json(errorMessage.duplicateUsernameOrEmail)
        return console.log(err)
      }
      if (result) {
        res.json({
          ok: 1,
          message: 'success',
        })
        req.session.user = username
        req.session.userId = result.dataValues.id
      }
    })
  },
}

module.exports = userController
