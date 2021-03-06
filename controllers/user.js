const errorMessage = require('../errorMessage.js')
const db = require('../models')
const FormData = require('form-data')
const fetch = require('node-fetch')
const bcrypt = require('bcryptjs')
const { general } = require('../errorMessage.js')
require('dotenv').config()
const imgurClientId = process.env.IMGUR_CLIENT_ID

const saltRounds = 11
const User = db.User

const userController = {
  getMe: async (req, res) => {
    const { userId, nickname, userLevel } = req.session
    if (!userId || !nickname || !userLevel)
      return res.json({ ok: 0, message: errorMessage.unauthorized })
    res.json({
      ok: 1,
      data: {
        userId,
        nickname,
        userLevel,
      },
    })
  },
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
    if (!user) return res.json(errorMessage.userNotFound)
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) return res.json(errorMessage.general)

      if (!result) return res.json(errorMessage.userNotFound)
      req.session.user = username
      req.session.userId = user.id
      req.session.nickname = user.nickname
      req.session.userLevel = user.user_level
      res.json({
        ok: 1,
        message: 'success',
        data: {
          userId: user.id,
          nickname: user.nickname,
          userLevel: user.user_level,
        },
      })
    })
  },
  logout: async (req, res) => {
    await req.session.destroy(err => {
      if (err) return res.json(errorMessage.general)
    })
    res.json({
      ok: 1,
      message: 'session destroyed.',
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
      if (err) {
        console.log(err)
        return res.json(errorMessage.general)
      }
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
      if (!result) return res.json(errorMessage.general)
      req.session.user = username
      req.session.userId = result.id
      req.session.nickname = result.nickname
      req.session.userLevel = result.user_level
      res.json({
        ok: 1,
        message: 'success',
        data: {
          userId: result.id,
          nickname: result.nickname,
          userLevel: result.user_level,
        },
      })
    })
  },
  banUser: async (req, res) => {
    if (!req.params.userId) return res.json(errorMessage.userIdNotFound)
    const { userId } = req.params
    let result
    try {
      result = await User.update(
        {
          user_level: 0,
        },
        {
          where: {
            id: userId,
          },
        }
      )
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.general)
    }
    if (!result) return res.json(errorMessage.userIdNotFound)
    res.json({
      ok: 1,
      message: 'success',
    })
  },
  unBanUser: async (req, res) => {
    if (!req.params.userId) return res.json(errorMessage.userIdNotFound)
    const { userId } = req.params
    let result
    try {
      result = await User.update(
        {
          user_level: 1,
        },
        {
          where: {
            id: userId,
          },
        }
      )
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.general)
    }
    if (!result) return res.json(errorMessage.userIdNotFound)
    res.json({
      ok: 1,
      message: 'success',
    })
  },
  findUser: async (req, res) => {
    if (!req.query.username) {
      let allUser
      try {
        allUser = await User.findAll({
          limit: 30,
          attributes: ['id', 'username', 'nickname', 'user_level'],
          order: [['id', 'ASC']],
        })
      } catch (err) {
        console.log(err)
        return res.json(errorMessage.general)
      }
      res.json({
        ok: 1,
        message: 'success',
        data: allUser,
      })
      return
    }
    const { username } = req.query
    let user
    try {
      user = await User.findOne({
        where: {
          username,
        },
        attributes: ['id', 'username', 'nickname', 'user_level'],
      })
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.userNotFound)
    }
    if (!user) return res.json(errorMessage.userNotFound)
    res.json({
      ok: 1,
      message: 'success',
      data: user,
    })
  },
  isAdmin: async (req, res, next) => {
    if (!req.session.userId) return res.json(errorMessage.needLogin)
    const adminId = req.session.userId
    let result
    try {
      result = await User.findOne({
        where: {
          id: adminId,
        },
      })
    } catch (err) {
      console.log(err)
      res.json(errorMessage.userIdNotFound)
    }
    if (!result) return res.json(errorMessage.userIdNotFound)
    if (result.user_level === 2) return next()

    return res.json(errorMessage.unauthorized)
  },
  getUserData: async (req, res) => {
    // ??????????????????????????????
    const userId = parseInt(req.params.user_id, 10)
    let result = null
    try {
      result = await User.findOne({
        where: { id: userId },
        attributes: ['nickname', 'picture_url', 'background_pic_url'],
      })
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.userIdNotFound)
    }
    const data = {
      ok: 1,
      message: 'success',
      data: result,
    }
    return res.json(data)
  },
  editUserData: async (req, res) => {
    if (!req.params.user_id) return res.json(errorMessage.missingParameter)
    const userId = parseInt(req.params.user_id, 10)
    const sessionId = parseInt(req.session.userId, 10)
    if (sessionId !== userId) return res.json(errorMessage.unauthorized)
    const { nickname } = req.body
    let avatarResult = null
    let backgroundResult = null
    if (req.files.avatar) {
      avatarResult = await uploadImage(req.files.avatar[0])
      if (!avatarResult) return res.json(errorMessage.fetchFail)
    }
    if (req.files.background) {
      backgroundResult = await uploadImage(req.files.background[0])
      if (!backgroundResult) return res.json(errorMessage.fetchFail)
    }
    let result = null
    try {
      result = await User.update(
        {
          nickname,
          picture_url: avatarResult,
          background_pic_url: backgroundResult,
        },
        {
          where: { id: userId },
          fields: [
            // ????????????????????????????????????????????????, ????????????????????????????????????
            nickname ? 'nickname' : null,
            req.files.avatar ? 'picture_url' : null,
            req.files.background ? 'background_pic_url' : null,
          ],
        }
      )
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.fetchFail)
    }
    return res.json({
      ok: 1,
      message: 'success',
    })
  },
}

module.exports = userController

async function uploadImage(file) {
  const myHeaders = new fetch.Headers()
  myHeaders.append('Authorization', `Client-ID ${imgurClientId}`)
  const formData = new FormData()
  formData.append('image', file.buffer)
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formData,
    redirect: 'follow',
  }
  const promiseResult = await fetch(
    'https://api.imgur.com/3/image',
    requestOptions
  )
  const result = await promiseResult.json()
  if (!result.success) return false
  return result.data.link
}
