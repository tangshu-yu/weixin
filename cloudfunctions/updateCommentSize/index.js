// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
})
const db = cloud.database();
exports.main = async (event, context) => {
   console.log("enent打印："+event);
  var postId = event.postId;
  var flags = event.flag;
  var count=event.commentSize;
  try {
    return await db.collection(flags).doc(postId).update({
      data: {
        commentSize: count
      }
    })
  } catch (e) {
    console.error(e)
  }
    return postId;
}