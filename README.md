# 吃貨地圖-後端

### 今晚想來點...?
> 不再猶豫，
> 交給吃貨地圖幫你做決定

[網站DEMO](https://api.outshaker.tw/#/home)

## 專案介紹
在這個生活越來越方便，美食越來越多的社會裡，不知道要吃什麼，總是猶豫不決，這是很多人都有過的困擾。

為了能夠快速解決這個問題，只要輸入所在地，除了會顯示附近二十家餐廳外，還有一個好手氣按鈕，隨機幫你選中一家餐廳。吃貨地圖還提供你記錄自己的美食日記，沒有複雜的介面，簡簡單單紀錄你此時此刻吃到的每一口感受。

## 使用技術

* 框架
  * Express
* 資料庫
  * Sequelize
* 套件
  * Express-session：設置 session 實作登入機制
  * dotenv：設置環境變數
  * multer：圖片上傳
  * node-fetch：在 Node.js 環境下使用 Fetch API
  * bcrypt：密碼加鹽
  * form-data：上傳圖片
* API
  * Imgur
  * Google Map

## 目錄結構說明

```
├── config                      
│   └── config.json
├── controllers                      
│   ├── post.js                
│   └── user.js   
├── errorMessage.js
├── migrations 
├── models                      
│   ├── index.js                
│   ├── picture.js       
│   ├── post.js 
│   ├── restaurant.js
│   ├── template.js
|   └── user.js
├── Procfile                
├── seeders                      
├── .eslintrc.js
├── .prettierrc.json
├── index.js
├── package-lock.json
├── package.json
├── README.md
├── .gitignore
└── .sequelizerc

```

* [資料庫結構](https://dbdiagram.io/d/6128a797825b5b0146e77e4d)

## 專案前端
吃貨地圖前端，採用 React 開發。
- [專案前端連結](https://github.com/chachachater/foodmap)

## 專案授權
- [MIT](https://choosealicense.com/licenses/mit/)