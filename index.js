if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const session = require('express-session')
const userController = require('./controllers/user')
const cors = require('cors')
const postController = require('./controllers/post.js')
const multer = require('multer')
const app = express()
const port = process.env.PORT || 5001
const sessionSecret = process.env.SESSION_SECRET || 'keyboard cat'

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', express.static('public'))

app.set('trust proxy', 1) // 反向代理需要設定這個，secure: true 才可以正常
app.use(
  session({
    secret: sessionSecret,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    },
  })
)
const upload = new multer({
  limits: {
    fileSize: 1054576, // bytes, equal to 1 MB
    files: 3,
    parts: 9,
  },
})
app.use(
  cors({
    origin: [
      'http://localhost:5000',
      'https://chachachater.github.io',
    ],
    credentials: true,
  })
)
app.use((req, res, next) => {
  res.locals.user = req.session.user || false
  res.locals.useId = req.session.useId || false
  next()
})
function isLogin(req, res, next) {
  if (!req.session.user)
    return res.json({ ok: 0, message: "you don't have cookie" })
  next()
}

app.get('/status', (req, res) => {
  if (!req.session) {
    res.status(401).end()
  } else {
    res.json({
      sid: req.sessionID,
      user: req.session.user,
      useId: req.session.userId
    })
  }
})

app.get('/get-me', isLogin, userController.getMe)
app.get('/cookie', (req, res) => {
  req.session.user = 'rich'
  req.session.userId = '1'
  res.json('give you cookie')
})

app.post('/register', userController.register)
app.post('/login', userController.login)
app.get('/logout', userController.logout)
app.patch('/admin/ban/:userId', userController.isAdmin, userController.banUser)
app.patch(
  '/admin/unban/:userId',
  userController.isAdmin,
  userController.unBanUser
)
app.get('/admin', userController.isAdmin, userController.findUser)
// app.get('/admin', isLogin, userController.findAllUsers)
app.get('/api/user/:user_id', userController.getUserData)
app.post(
  '/api/user/:user_id',
  isLogin,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 },
  ]),
  userController.editUserData
)
app.get('/success', isLogin, (req, res) => {
  res.json(
    `yes you have cookie. you name is ${req.session.user} and your id is ${req.session.userId}`
  )
})
app.get('/api/map', postController.getPostsByPlaceId)
app.get('/api/post', postController.getAllPosts)
app.get('/api/post/user/:user_id', postController.getPosts)
app.get('/api/post/:post_id', postController.getPost)
app.post(
  '/api/post',
  isLogin,
  postController.isBan,
  upload.array('images'),
  postController.addPost
)

app.patch(
  '/api/post/:post_id',
  isLogin,
  postController.isBan,
  upload.array('images'),
  postController.editPost
)
app.delete('/api/post/:post_id', isLogin, postController.deletePost)

app.listen(port, () => {
  console.log(`run server at http://localhost:${port}`)
})
