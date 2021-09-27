const db = require("../models");
const FormData = require("form-data");
const fetch = require("node-fetch");
// const { imgurkey } = require("../../ignore") ;
const imgurkey = null;
const PostDb = db.Post; // model name
const PictureDb = db.Picture; // model name
const UserDb = db.User; // model name

module.exports = {
  getUserPosts: async (req, res) => {
    // 取得單一使用者的複數食記
    const userId = parseInt(req.params.user_id, 10);
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    const { order } = req.query; //views, createdAt
    let result = null;
    let imageResult = null;
    let imageArr = [];
    try {
      result = await PostDb.findAndCountAll({
        where: { user_id: userId },
        order: [[order, "DESC"]],
        offset,
        limit,
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getPosts: false,
        reason: "取得文章失敗",
      });
    }
    for (let i = 0; i < result.rows.length; i++) {
      try {
        imageResult = await PictureDb.findOne({
          where: { post_id: result.rows[i].id },
        });
      } catch (err) {
        console.log(err);
        console.log("errMessage", "發生錯誤");
        return res.json({
          getPosts: false,
          reason: "取得文章圖片失敗",
        });
      }
      if (!imageResult) continue;
      imageArr.push({
        postId: imageResult.post_id,
        link: imageResult.food_picture_url,
      });
    }

    const data = {
      count: result.count,
      posts: result.rows.map((each) => each.dataValues),
      images: imageArr,
    };
    return res.json(data);
  },
  addPost: async (req, res) => {
    const imageCount = req.files.length;
    console.log(req.body);
    // const checkList = ['user_id', 'restaurant_id', 'title', 'content', 'visited_date', 'is_published']
    // if (!checkList.every(key => Object.keys(req.body).includes(key))) {
    //   res.end(req.body)
    // }
    const imageResult = await uploadImage(req);
    if (!imageResult)
      return res.json({
        upload: false,
        reason: "圖片上傳 Imgur 失敗",
      });
    const {
      user_id,
      restaurant_id,
      title,
      content,
      visited_time,
      is_published,
    } = req.body;
    let postResult = null;
    try {
      postResult = await PostDb.create({
        user_id,
        restaurant_id,
        title,
        content,
        visited_time,
        is_published,
      });
    } catch (err) {
      console.log("errMessage", "PostDb.create 發生錯誤");
      console.log(err);
      return res.json({
        upload: false,
        reason: "文章上傳失敗",
      });
    }
    try {
      for (let i = 0; i < imageCount; i++) {
        await PictureDb.create({
          post_id: postResult.id,
          restaurant_id,
          food_picture_url: imageResult[i],
        });
      }
    } catch (err) {
      console.log("errMessage", "PictureDb.create 發生錯誤");
      console.log(err);
      return res.json({
        upload: false,
        reason: "圖片上傳失敗",
      });
    }
    return res.json({
      upload: true,
    });
  },
  getUserPost: async (req, res) => {
    // 取得單一使用者的單一食記
    console.log("取得單一使用者的單一食記");
    console.log(req.params);
    console.log(req.query);
    const postId = parseInt(req.params.post_id, 10);
    let result = null;
    let imageResult = null;
    let imageArr = [];
    try {
      result = await PostDb.findOne({
        where: { id: postId },
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getPost: false,
        reason: "取得文章失敗",
      });
    }
    try {
      imageResult = await PictureDb.findAndCountAll({
        where: { post_id: result.id },
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getPost: false,
        reason: "取得文章圖片失敗",
      });
    }
    imageResult.rows.forEach((each) => imageArr.push(each.food_picture_url));
    const data = {
      post: result,
      images: imageArr,
    };
    return res.json(data);
  },
  editPost: async (req, res) => {
    const imageCount = req.files.length;
    const postId = parseInt(req.params.post_id, 10);
    const imageResult = await uploadImage(req);
    console.log(imageResult);
    if (!imageResult)
      return res.json({
        upload: false,
        reason: "圖片上傳 Imgur 失敗",
      });
    const {
      restaurant_id,
      title,
      content,
      visited_time,
      is_published,
    } = req.body;
    let editResult = null;
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
      );
    } catch (err) {
      console.log("errMessage", "PostDb.update 發生錯誤");
      console.log(err);
      return res.json({
        upload: false,
        reason: "文章編輯失敗",
      });
    }
    console.log(editResult);
    try {
      await PictureDb.destroy({
        where: {
          post_id: postId,
        },
      });
    } catch (err) {
      console.log("errMessage", "PictureDb.destroy 發生錯誤");
      console.log(err);
      return res.json({
        upload: false,
        reason: "文章圖片編輯失敗",
      });
    }
    try {
      for (let i = 0; i < imageCount; i++) {
        await PictureDb.create({
          post_id: postId,
          restaurant_id,
          food_picture_url: imageResult[i],
        });
      }
    } catch (err) {
      console.log("errMessage", "PictureDb.create 發生錯誤");
      console.log(err);
      return res.json({
        upload: false,
        reason: "圖片上傳失敗",
      });
    }
    return res.json({
      upload: true,
    });
  },
  deletePost: async (req, res) => {
    const postId = parseInt(req.params.post_id, 10);
    let result = null;
    try {
      result = await PostDb.update(
        {
          is_deleted: true,
        },
        {
          where: { id: postId },
        }
      );
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        delete: false,
        reason: "刪除文章失敗",
      });
    }
    console.log(result)
    res.json({
      delete: true,
    });
  },
  getPosts: async (req, res) => {
    // 取得單一使用者的複數食記
    const userId = parseInt(req.params.user_id, 10);
    const offset = parseInt(req.query.offset, 10);
    const limit = parseInt(req.query.limit, 10);
    const { order } = req.query; //views, createdAt
    let result = null;
    let imageResult = null;
    let imageArr = [];
    try {
      result = await PostDb.findAndCountAll({
        where: {
          user_id: userId,
          is_deleted: false,
        },
        order: [[order, "DESC"]],
        offset,
        limit,
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getPosts: false,
        reason: "取得文章失敗",
      });
    }
    for (let i = 0; i < result.rows.length; i++) {
      try {
        imageResult = await PictureDb.findOne({
          where: { post_id: result.rows[i].id },
        });
      } catch (err) {
        console.log(err);
        console.log("errMessage", "發生錯誤");
        return res.json({
          getPosts: false,
          reason: "取得文章圖片失敗",
        });
      }
      if (!imageResult) continue;
      imageArr.push({
        postId: imageResult.post_id,
        link: imageResult.food_picture_url,
      });
    }

    const data = {
      count: result.count,
      posts: result.rows.map((each) => each.dataValues),
      images: imageArr,
    };
    return res.json(data);
  },
  getPost: async (req, res) => {
    // 取得單一使用者的單一食記
    console.log("取得單一使用者的單一食記");
    console.log(req.params);
    console.log(req.query);
    const postId = parseInt(req.params.post_id, 10);
    let result = null;
    let imageResult = null;
    let imageArr = [];
    try {
      result = await PostDb.findOne({
        where: {
          id: postId,
          is_deleted: false,
        },
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getPost: false,
        reason: "取得文章失敗",
      });
    }
    try {
      imageResult = await PictureDb.findAndCountAll({
        where: { post_id: result.id },
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getPost: false,
        reason: "取得文章圖片失敗",
      });
    }
    imageResult.rows.forEach((each) => imageArr.push(each.food_picture_url));
    const data = {
      post: result,
      images: imageArr,
    };
    return res.json(data);
  },
  getUserData: async (req, res) => {
    // 取得使用者的個人資料
    const userId = req.params.user_id;
    let result = null;
    try {
      result = await UserDb.findOne({
        where: { user_id: userId },
        attributes: ['nickname', 'picture_url', 'background_pic_url'],
      });
    } catch (err) {
      console.log(err);
      console.log("errMessage", "發生錯誤");
      return res.json({
        getUserData: false,
        reason: "取得資料失敗",
      });
    }
    const data = {
      data: result
    };
    return res.json(data);
  },
  editUserData: async (req, res) => {
    const userId = req.params.user_id;
    let result = null;
    const imageCount = req.files.length;
    const imageResult = await uploadImage(req);
    console.log(imageResult);
    if (!imageResult)
      return res.json({
        upload: false,
        reason: "圖片上傳 Imgur 失敗",
      });
    const {
      nickname
    } = req.body;
    let editResult = null;
    try {
      editResult = await UserDb.update(
        {
          nickname,
          picture_url: imageResult[0],
          background_pic_url: imageResult[1]
        },
        {
          where: { id: userId },
        }
      );
    } catch (err) {
      console.log("errMessage", "PostDb.update 發生錯誤");
      console.log(err);
      return res.json({
        upload: false,
        reason: "編輯失敗",
      });
    }
    console.log(editResult);
    return res.json({
      upload: true,
    });
  },
};

async function uploadImage(req) {
  console.log(req.files);

  const imgurResultArr = [];
  for (let i = 0; i < req.files.length; i++) {
    const myHeaders = new fetch.Headers();
    myHeaders.append("Authorization", `Client-ID ${imgurkey}`);
    const formData = new FormData();
    formData.append("image", req.files[i].buffer);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };
    const promiseResult = await fetch(
      "https://api.imgur.com/3/image",
      requestOptions
    );
    const result = await promiseResult.json();
    if (!result.success) return false;
    imgurResultArr.push(result.data.link);
  }
  return imgurResultArr;
}
