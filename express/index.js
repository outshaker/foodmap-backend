const express = require("express");
const postController = require("./controllers/post.js");
var bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5001;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = new multer({
  limits: {
    fileSize: 1054576, // bytes, equal to 1 MB
    files: 3,
    parts: 8,
  },
});

app.get("/api/post/user/:user_id", postController.getUserPosts);
app.get("/api/post/:post_id", postController.getUserPost);
app.post("/api/post", upload.array("image"), postController.addPost);
app.patch("/api/post/:post_id", upload.array("image"), postController.editPost);
app.delete("/api/post/:post_id", postController.deletePost);

app.get("/api/user-data/:user_id", postController.getUserData);
app.post("/api/user-data/:user_id", postController.editUserData);

app.get("/api/post/guest/:user_id", postController.getPosts);
app.get(
  "/api/post/guest/:user_id/:post_id",
  upload.array("image"),
  postController.getPost
);
app.listen(port, () => {
  console.log("5001 port listenring now...");
});
