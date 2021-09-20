const express = require('express')
const session = require('express-session')
const userController = require('./controller/user')
const bodyParser = require('body-parser')

const app = express()
const port = 5001
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
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
    `yes you have cookie. you name is ${req.session.user} and you id is ${
      req.session.userId
    }`
  )
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
