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
      res.json({
        ok: 0,
        message: 'something goes wrong.',
      })
      console.log(err)
      return
    }
    if (!user) return res.json('wrong username or password')
    console.log(user.id)
    bcrypt.compare(password, user.password, function(err, result) {
      if (err)
        return res.json({
          ok: 0,
          message: 'something goes wrong.',
        })
      if (result) {
        req.session.user = username
        req.session.userId = user.id
        res.json({
          ok: 1,
          message: 'Welcome',
        })
        return
      }
      res.json({
        ok: 0,
        message: 'incorrect username or password',
      })
    })
  },
  logout: async (req, res) => {
    await req.session.destroy(err => {
      if (err) return res.json('something goes wrong.')
    })
    res.json({
      ok: 1,
      message: 'session destroyed',
    })
  },
  register: async (req, res) => {
    const { username, email, password, password2 } = req.body
    let result
    if (password !== password2) {
      return res.json({
        ok: 0,
        message: '密碼不相同，請確認後再次提交',
      })
    }
    const re = /^[^ ]{6,64}$/
    if (!re.test(password))
      return res.json({
        ok: 0,
        message: 'password too short or contains blanks.',
      })
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) return res.json('somethings goes wrong.')
      try {
        result = await User.create({
          username,
          password: hash,
          email,
        })
      } catch (err) {
        res.json({
          ok: 0,
          message: 'something goes wrong.',
        })
        return console.log(err)
      }
      if (result) {
        res.json({
          ok: 1,
          message: 'success',
        })
      }
    })
  },
}

module.exports = userController
