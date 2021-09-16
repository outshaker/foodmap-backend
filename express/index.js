const express = require('express')
const postController = require('./controllers/post.js')
var bodyParser = require('body-parser')
const multer = require('multer')
const flash = require('connect-flash')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 5001
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const upload = new multer({
  limits: {
    fileSize: 1054576, // bytes, equal to 1 MB
    files: 3,
    parts: 8
  }
})

app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: false,
  resave: false,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
}))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.locals.user = req.session.user || false
  res.locals.useId = req.session.useId || false
  next()
})
function isLogin(req, res, next) {
  if (!req.session.user) {
    res.send("you don't have cookie")
    return
  }
  next()
}

app.get('/api/post/user/:user_id', postController.getUserPosts)
app.get('/api/post/user/:user_id/:post_id', postController.getUserPost)
app.post('/api/post', upload.array('image'), postController.addPost)
app.patch('/api/post/:post_id', upload.array('image'), postController.editPost)
app.delete('/api/post/:post_id', postController.deletePost)

app.get('/api/post/guest/:user_id', postController.getPosts)
app.get('/api/post/guest/:user_id/:post_id', postController.getPost)
app.listen(port, () => {
  console.log('5001 port listenring now...')
})
