const errorMessage = {
  userNotFound: {
    ok: 0,
    message: 'invalid username or password',
  },
  needLogin: {
    ok: 0,
    message: 'Please login to continue',
  },
  unauthorized: {
    ok: 0,
    message: "Sorry, you don't have permission to visit this site",
  },
  general: {
    ok: 0,
    message: 'please try again',
  },
  usernameError: {
    ok: 0,
    message: 'username format incorrect',
  },
  passwordNotSame: {
    ok: 0,
    message: 'please check your password is correct and submit again',
  },
  passwordError: {
    ok: 0,
    message: 'password format incorrect',
  },
  duplicateUsernameOrEmail: {
    ok: 0,
    message: 'duplicate username or email',
  },
}
module.exports = errorMessage
