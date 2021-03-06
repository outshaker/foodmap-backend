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
app.use(
  session({
    secret: sessionSecret,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
)
const upload = new multer({
  limits: {
    fileSize: 10545760, // bytes, equal to 10 MB
    files: 3,
    parts: 9,
  },
})
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
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

app.get('/', (req, res) => {
  res.json('Hello World!')
})
app.get('/get-me', isLogin, userController.getMe)
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
  console.log(`Example app listening at http://localhost:${port}`)
})
