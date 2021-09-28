const express = require('express')
const session = require('express-session')
const userController = require('./controllers/user')
const bodyParser = require('body-parser')
const cors = require('cors')
const postController = require('./controllers/post.js')
const multer = require('multer')

const app = express()
const port = process.env.PORT || 5001
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
)
const upload = new multer({
  limits: {
    fileSize: 1054576, // bytes, equal to 1 MB
    files: 3,
    parts: 8,
  },
})
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)
app.use((req, res, next) => {
  res.locals.user = req.session.user || false
  res.locals.useId = req.session.useId || false
  next()
})
function isLogin(req, res, next) {
  if (!req.session.user) {
    res.json("you don't have cookie")
    return
  }
  next()
}

app.get('/', (req, res) => {
  res.json('Hello World!')
})
app.get('/cookie', (req, res) => {
  req.session.user = 'rich'
  req.session.userId = '1'
  res.json('give you cookie')
})
app.post('/register', userController.register)
app.post('/login', userController.login)
app.get('/logout', userController.logout)
app.get('/success', isLogin, (req, res) => {
  res.json(
    `yes you have cookie. you name is ${req.session.user} and you id is ${req.session.userId}`
  )
})
app.get('/api/post/user/:user_id', postController.getUserPosts)
app.get('/api/post/:post_id', postController.getUserPost)
app.post('/api/post', upload.array('image'), postController.addPost)
app.patch('/api/post/:post_id', upload.array('image'), postController.editPost)
app.delete('/api/post/:post_id', postController.deletePost)
app.get('/api/user-data/:user_id', postController.getUserData)
app.post('/api/user-data/:user_id', postController.editUserData)
app.get('/api/post/guest/:user_id', postController.getPosts)
app.get(
  '/api/post/guest/:user_id/:post_id',
  upload.array('image'),
  postController.getPost
)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
