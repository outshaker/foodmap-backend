const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const userController = require('./controller/user.js')
const app = express()
const port = 5001

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

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/cookie', (req, res) => {
  req.session.user = 'rich'
  req.session.useId = '1'
  res.send('give you cookie')
})
app.post('/register', userController.register)
app.post('/login', userController.login)
app.get('/logout', userController.logout)
app.get('/success', isLogin, (req, res) => {
  res.send(`yes you have cookie. you name is ${req.session.user} and you id is ${req.session.userId}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})