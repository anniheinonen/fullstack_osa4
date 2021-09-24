require('dotenv').config()
//let PORT = 3003
//let MONGODB_URI = 'mongodb+srv://anni:kissa123@cluster0.rdszi.mongodb.net/blog-posts?retryWrites=true&w=majority'
const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI
module.exports = {
  MONGODB_URI,
  PORT
}