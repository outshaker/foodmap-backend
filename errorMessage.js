const errorMessage = {
  userNotFound: {
    ok: 0,
    message: 'invalid username or password.',
  },
  userIdNotFound: {
    ok: 0,
    message: 'invalid userId.',
  },
  needLogin: {
    ok: 0,
    message: 'Please login to continue.',
  },
  unauthorized: {
    ok: 0,
    message: 'unauthorized.',
  },
  fetchFail: {
    ok: 0,
    message: 'Fail to fetch.',
  },
  missingParameter: {
    ok: 0,
    message: 'Please input query parameter.',
  },
  general: {
    ok: 0,
    message: 'please try again.',
  },
  usernameError: {
    ok: 0,
    message: 'username format incorrect.',
  },
  passwordNotSame: {
    ok: 0,
    message: 'please check your password is correct and submit again.',
  },
  passwordError: {
    ok: 0,
    message: 'password format incorrect.',
  },
  duplicateUsernameOrEmail: {
    ok: 0,
    message: 'duplicate username or email or invalid email format',
  },
  noPhotos: {
    ok: 0,
    message: 'at least one photo',
  },
  postNotFound: {
    ok: 0,
    message: 'post not found',
  },
  invalidDate: {
    ok: 0,
    message: 'Invalid date'
  },
}
module.exports = errorMessage
