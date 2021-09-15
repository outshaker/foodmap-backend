const db = require('../models')
const bcrypt = require('bcrypt')
const saltRounds = 11

const User = db.User

const userController = {
  login: async (req, res) => {
    const { username, password } = req.body
    let user;
    try {
      user = await User.findOne({
          where: {
            username,
          }
        })
    } catch(err) {
      res.send({
        ok: 0,
        message: 'something goes wrong.'
      })
      console.log(err)
      return
    }
    if (!user) return res.send('wrong username or password')
    console.log(user.id)
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) return res.send({
        ok: 0,
        message: 'something goes wrong.'
      })
      if (result) {
        req.session.user = username
        req.session.userId = user.id
        res.send({
          ok:1,
          message: 'Welcome'
        })
        return
      }
      res.send({
        ok: 0,
        message: 'incorrect username or password'
      })
    })
       
  },
  logout: async (req, res) => {
    await req.session.destroy((err) => {
      if (err) return res.send('something goes wrong.')
    })
    res.send({
      ok :1,
      message:'session destroyed'
    })
  },
  register: async (req, res) => {
    const { username, email, password, password2 } = req.body
    let result
    if (password !== password2) {
      return res.send({
        ok: 0,
        message: "密碼不相同，請確認後再次提交"
      })
    }
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) return res.send('somethings goes wrong.')
      try {
        result = await User.create({
          username,
          password:hash,
          email,
        })
      } catch(err) {
        return res.send({
          ok: 0,
          message: err
        })
      }
      if (result) {
        res.send({
          ok: 1,
          message: "success"
        })
      }
    })
  }
}

module.exports = userController
