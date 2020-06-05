// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  var postId=event._id;
  console.log("删除评论"+postId);
  try {
    return await db.collection('commentList').doc(postId).remove()
  } catch (e) {
    console.error(e)
  }
}