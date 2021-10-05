const db = require('../models')
const FormData = require('form-data')
const fetch = require('node-fetch')
require('dotenv').config()
const imgurClientId = process.env.IMGUR_CLIENT_ID
const errorMessage = require('../errorMessage.js')
const { query } = require('express')

const PostDb = db.Post
const PictureDb = db.Picture
const User = db.User
const okMessage = {
  ok: 1,
  message: 'Success.',
}
const queryAttributes = [
  'id',
  'title',
  'content',
  'restaurant_id',
  'visited_time',
  'is_published',
  'createdAt',
  'views',
]

module.exports = {
  getAllPosts: async (req, res) => {
    // 取得所有食記
    const checkedList = ['offset', 'limit']
    if (!checkedList.every(key => Object.keys(req.query).includes(key))) {
      return res.json(errorMessage.missingParameter)
    }
    const queryData = {}
    queryData.offset = parseInt(req.query.offset, 10)
    queryData.limit = parseInt(req.query.limit, 10)
    queryData.order = 'createdAt'
    let result = await getUnpublishedPosts(false, queryData)
    if (!result) return res.json(errorMessage.fetchFail)
    return res.json(result)
  },
  getPostsByPlaceId: async (req, res) => {
    // 取得PlaceId 的食記
    const checkedList = ['offset', 'limit']
    if (!checkedList.every(key => Object.keys(req.query).includes(key))) {
      return res.json(errorMessage.missingParameter)
    }
    const queryData = {}
    queryData.offset = parseInt(req.query.offset, 10)
    queryData.limit = parseInt(req.query.limit, 10)
    queryData.order = 'createdAt'
    queryData.restaurant_id = req.query.restaurant_id

    let result = await getPostsByPlaceId(false, queryData)
    if (!result) return res.json(errorMessage.fetchFail)
    return res.json(result)
  },
  getPosts: async (req, res) => {
    // 取得單一使用者的複數食記
    const checkedList = ['offset', 'limit', 'order']
    console.log(req.session.user)
    console.log(req.session.userId)
    console.log(req.params.user_id)
    console.log(!req.session.user || req.session.userId != req.params.user_id)
    if (!checkedList.every(key => Object.keys(req.query).includes(key))) {
      return res.json(errorMessage.missingParameter)
    }
    const queryData = {}
    queryData.userId = parseInt(req.params.user_id, 10)
    queryData.offset = parseInt(req.query.offset, 10)
    queryData.limit = parseInt(req.query.limit, 10)
    queryData.order = req.query.order
    if (!req.session.user || req.session.userId != req.params.user_id) {
      let result = await getUnpublishedPosts(false, queryData)
      if (!result) return res.json(errorMessage.fetchFail)
      return res.json(result)
    }
    let result = await getUnpublishedPosts(true, queryData)
    if (!result) return res.json(errorMessage.fetchFail)
    return res.json(result)
  },
  getPost: async (req, res) => {
    // 取得單一使用者的單一食記
    const postId = parseInt(req.params.post_id, 10)
    if (!req.session.user || req.session.userId !== req.params.user_id) {
      let result = await getUnpublishedPost(false, postId)
      if (!result) return res.json(errorMessage.fetchFail)
      return res.json(result)
    }
    let result = await getUnpublishedPost(true, postId)
    if (!result) return res.json(errorMessage.fetchFail)
    return res.json(result)
  },
  addPost: async (req, res) => {
    console.log(req.session.userId)
    console.log(req.body.user_id)
    console.log(req.files)
    if (req.session.userId != req.body.user_id) {
      return res.json(errorMessage.unauthorized)
    }
    if (!req.files) return res.json(errorMessage.noPhotos)
    if (req.files.length < 1) return res.json(errorMessage.noPhotos)
    const checkedList = [
      'user_id',
      'restaurant_id',
      'title',
      'content',
      'visited_time',
      'is_published',
    ]
    if (!checkedList.every(key => Object.keys(req.body).includes(key))) {
      console.log('Please input query parameter.')
      return res.json(errorMessage.missingParameter)
    }
    const imageCount = req.files.length
    const imageResult = await uploadImage(req)
    if (!imageResult) return res.json(errorMessage.fetchFail)
    const {
      user_id,
      restaurant_id,
      title,
      content,
      visited_time,
      is_published,
    } = req.body
    let postResult = null
    try {
      postResult = await PostDb.create({
        user_id,
        restaurant_id,
        title,
        content,
        visited_time,
        is_published,
      })
    } catch (err) {
      console.log(err)
      if (err.ValidationErrorItem)
        return res.json(err.ValidationErrorItem.message)
      return res.json(errorMessage.fetchFail)
    }
    try {
      for (let i = 0; i < imageCount; i++) {
        await PictureDb.create({
          post_id: postResult.id,
          restaurant_id,
          food_picture_url: imageResult[i],
        })
      }
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.fetchFail)
    }
    return res.json(okMessage)
  },
  getPostsByPlaceId: async (req, res) => {
    // 取得PlaceId 的食記
    const checkedList = ['offset', 'limit']
    if (!checkedList.every(key => Object.keys(req.query).includes(key))) {
      return res.json(errorMessage.missingParameter)
    }
    const queryData = {}
    queryData.restaurant_id = req.query.place_id
    queryData.offset = parseInt(req.query.offset, 10)
    queryData.limit = parseInt(req.query.limit, 10)
    queryData.order = req.query.order
    let result = await getPostsByPlaceId(false, queryData)
    if (!result) return res.json(errorMessage.fetchFail)
    return res.json(result)
  },
  editPost: async (req, res) => {
    if (req.session.userId !== req.params.user_id) {
      return res.json(errorMessage.unauthorized)
    }
    const imageCount = req.files.length
    const postId = parseInt(req.params.post_id, 10)
    const imageResult = await uploadImage(req)
    console.log(imageResult)
    if (!imageResult) return res.json(errorMessage.fetchFail)
    const {
      restaurant_id,
      title,
      content,
      visited_time,
      is_published,
    } = req.body
    let editResult = null
    try {
      editResult = await PostDb.update(
        {
          restaurant_id,
          title,
          content,
          visited_time,
          is_published,
        },
        {
          where: { id: postId },
        }
      )
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.fetchFail)
    }
    console.log(editResult)
    try {
      await PictureDb.destroy({
        where: {
          post_id: postId,
        },
      })
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.fetchFail)
    }
    try {
      for (let i = 0; i < imageCount; i++) {
        await PictureDb.create({
          post_id: postId,
          restaurant_id,
          food_picture_url: imageResult[i],
        })
      }
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.fetchFail)
    }
    return res.json(okMessage)
  },
  deletePost: async (req, res) => {
    const postId = parseInt(req.params.post_id, 10)
    let result = null
    try {
      result = await PostDb.update(
        {
          is_deleted: true,
        },
        {
          where: { user_id: req.session.userId, id: postId },
        }
      )
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.fetchFail)
    }
    if (!result) return res.json(errorMessage.unauthorized)
    return res.json(okMessage)
  },
  isBan: async (req, res, next) => {
    const id = req.session.userId
    console.log('isBan')
    let result
    try {
      result = await User.findOne({ where: { id } })
    } catch (err) {
      console.log(err)
      return res.json(errorMessage.general)
    }
    console.log(result)
    if (!result) return res.json(errorMessage.userNotFound)
    if (result.user_level === 0) return res.json(errorMessage.unauthorized)
    next()
  },
}

async function uploadImage(req) {
  console.log(req.files)

  const imgurResultArr = []
  for (let i = 0; i < req.files.length; i++) {
    const myHeaders = new fetch.Headers()
    myHeaders.append('Authorization', `Client-ID ${imgurClientId}`)
    const formData = new FormData()
    formData.append('image', req.files[i].buffer)
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
    imgurResultArr.push(result.data.link)
  }
  return imgurResultArr
}

async function getUnpublishedPosts(unpublished = false, queryData) {
  const { userId, offset, limit, order } = queryData
  let where = { user_id: userId, is_deleted: false, is_published: true }
  if (unpublished) {
    where = { user_id: userId, is_deleted: false }
  }
  if (!userId) {
    where = { is_deleted: false, is_published: true }
  }
  let result = null
  let imageResult = null
  let imageArr = []
  try {
    result = await PostDb.findAndCountAll({
      where,
      attributes: queryAttributes,
      order: [[order, 'DESC']],
      offset,
      limit,
    })
    console.log(result)
  } catch (err) {
    return false
  }
  if (!result) return {}
  for (let i = 0; i < result.rows.length; i++) {
    try {
      imageResult = await PictureDb.findOne({
        where: { post_id: result.rows[i].id },
      })
      console.log(imageResult)
    } catch (err) {
      console.log(err)
      return false
    }
    if (!imageResult) continue
    imageArr.push({
      postId: imageResult.post_id,
      link: imageResult.food_picture_url,
    })
  }
  const data = {
    postCounts: result.count,
    posts: result.rows.map(each => each.dataValues),
    images: imageArr,
  }
  console.log(data)
  return data
}

async function getUnpublishedPost(unpublished = false, postId) {
  let where = { id: postId, is_deleted: false, is_published: true }
  if (unpublished) {
    where = { id: postId, is_deleted: false }
  }
  let result = null
  let imageResult = null
  let imageArr = []
  try {
    result = await PostDb.findOne({
      where,
      attributes: [
        'id',
        'user_id',
        'title',
        'content',
        'restaurant_id',
        'visited_time',
        'is_published',
      ],
    })
  } catch (err) {
    console.log(err)
    return false
  }
  if (!result) return {}
  try {
    imageResult = await PictureDb.findAndCountAll({
      where: { post_id: result.id },
    })
  } catch (err) {
    console.log(err)
    return false
  }
  imageResult.rows.forEach(each => imageArr.push(each.food_picture_url))
  const data = {
    post: result,
    images: imageArr,
  }
  return data
}

async function getPostsByPlaceId(unpublished = false, queryData) {
  const { offset, limit, order, restaurant_id } = queryData
  let result = null
  try {
    result = await PostDb.findAndCountAll({
      where: {
        restaurant_id,
        is_deleted: false,
        is_published: true,
      },
      attributes: queryAttributes,
      order: [[order, 'DESC']],
      offset,
      limit,
      include: {
        model: PictureDb,
        attributes: ['food_picture_url'],
      },
    })
  } catch (err) {
    console.log(err)
    return false
  }
  return result
}