const errorMessage = require('../errorMessage.js')
const db = require('../models')
const FormData = require('form-data')
const fetch = require('node-fetch')
const { imgurClientId } = require("../../ignore/key");
const bcrypt = require('bcrypt')
const saltRounds = 11

const User = db.User

const errMessage = {
  ok: 0,
  message: 'Fail to fetch.',
}

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
  getUserData: async (req, res) => {
    // 取得使用者的個人資料
    const userId = parseInt(req.params.user_id, 10)
    let result = null
    try {
      result = await User.findOne({
        where: { id: userId },
        attributes: ['nickname', 'picture_url', 'background_pic_url'],
      })
    } catch (err) {
      console.log(err)
      return res.json({
        ok: 0,
        message: 'Fail to get data.',
      })
    }
    const data = {
      data: result,
    }
    return res.json(data)
  },
  editUserData: async (req, res) => {
    console.log(req.files)
    if (!req.params.user_id) {
      return res.json({
        ok: 0,
        message: 'Please input query parameter.',
      })
    }
    if (req.session.userId !== req.params.user_id) {
      return res.json({
        ok: 0,
        message: 'Unauthorized.'
      })
    }
    const userId = req.params.user_id
    const { nickname } = req.body
    console.log(nickname)
    let avatarResult = null
    let backgroundResult = null
    if (req.files.avatar) {
      avatarResult = await uploadImage(req.files.avatar[0])
      if (!avatarResult) return res.json(errMessage)
    }
    if (req.files.background) {
      backgroundResult = await uploadImage(req.files.background[0])
      if (!backgroundResult) return res.json(errMessage)
    }
    console.log(avatarResult, backgroundResult)
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
          fields: [ // 判斷有輸入編輯內容的欄位才做改變, 沒輸入編輯內容則維持原狀
            nickname ? 'nickname' : null,
            req.files.avatar ? 'picture_url' : null,
            req.files.background ? 'background_pic_url' : null,
          ]
        }
      )
    } catch (err) {
      console.log(err)
      return res.json(errMessage)
    }
    console.log(result)
    return res.json({
      ok: ㄅ,
    })
  },
}

module.exports = userController

async function uploadImage(file) {
  console.log(file)
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