var db = wx.cloud.database();
Page({
  data: {

    content: "",
    postId: null,
    userName: null,
    avatarUrl: null,
    date: null,
    likedCount: 0,
    flags: '',
    userInfo: {
      avatarUrl: "", //用户头像
      nickName: "", //用户昵称
    },
    page: 1,
    pageSize: 20,
    queryResult: []
  },

  /**
   * 第一页查询
   */
  queryPageOne: function () {
    var postId = this.data.postId;
    var that = this;
    //页码
    var pageNum = that.data.page;
    //一页的记录数1gf
    var pageSize = that.data.pageSize;
    //queryREsult
    var res = that.data.queryResult;
    // 查询当前用户所有的 counters
    db.collection('commentList').where({
      postId: postId
    }).limit(pageSize).orderBy('likedCount', 'desc').get({
      success: res => {
        //追加数据
        // this.data.queryResult.unshift(res.data);
        this.setData({
          // queryResult: JSON.stringify(res.data, null, 2)
          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1
        })
        console.log('[数据库] [查询记录] 成功: ', this.data.queryResult);
        res.data.forEach(function (item, index) {
          db.collection('commentList').doc(item._id).update({
            // data 传入需要局部更新的数据
            data: {
              isRead: "已读"
            } , success:res=>{
              
            } ,fail:err=>{
              console.error('[数据库] [查询记录] 失败：', err)
            }

          })
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * 分页查询 不是第一页使用这个方法
   */
  queryByPage: function () {
    var postId = this.data.postId;
    var that = this;
    //页码
    var pageNum = that.data.page;
    //一页的记录数1gf
    var pageSize = that.data.pageSize;
    //queryREsult
    var res = that.data.queryResult;
    // 查询当前用户所有的 counters
    db.collection('commentList').where({
      postId: postId
    }).skip((pageNum - 1) * pageSize).limit(pageSize).orderBy('likedCount', 'desc').get({
      success: res => {

        //追加数据
        this.setData({
          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1
        })
        console.log('[数据库] [查询记录] 成功: ', res.data);

        //更新已读
        res.data.forEach(function (item, index) {
          db.collection('commentList').doc(item._id).update({
            // data 传入需要局部更新的数据
            data: {
              isRead: "已读"
            } , success:res=>{
              
            } ,fail:err=>{
              console.error('[数据库] [查询记录] 失败：', err)
            }

          })
        })

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  //查询数据
  onQuery: function () {
    var pageNum = this.data.page;
    if (pageNum == 1) {
      this.queryPageOne();
    } else {
      this.queryByPage();
    }
  },

  //失去焦点时获取里面评论内容
  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value,
    })
  },

  /**
   * 按钮点击触发事件 提交评论
   **/
  formSubmit(e) {
    // this.bindTextAreaBlur();
    //test

    //获取时间
    var util = require('../../../utils/util.js')
    var content = this.data.content;
    var userName = this.data.userInfo.nickName;
    var avatarUrl = this.data.userInfo.avatarUrl;
    var postId = this.data.postId;
    var Time = util.formatTime(new Date());
    var likedCount = this.data.likedCount;

    if (content != "") {
      console.log("发表评论：" + content);
      db.collection('commentList').add({
        data: {
          postId: postId,
          userName: userName,
          content: content,
          date: Time,
          likedCount: likedCount,
          avatarUrl: avatarUrl,
          status: false,
          isRead: "未读"
        },
        success: res => {


          //更新评论
          this.setData({
            queryResult: [],
            page: 1
          });
          this.onQuery();


          wx.showToast({
            title: '发表评论成功',
          })
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '发表评论失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      });


      //清空输入框
      this.setData({
        content: ""
      })
      //更新评论数
      this.updateCommentCount(postId);

    }

  },

  /**
   * 更新评论数
   */

  updateCommentCount(postId) {

    console.log("postID为：" + postId)
    db.collection(this.data.flags).where({
      _id: postId
    }).get({
      success: res => {
        console.log(res);
        var count = res.data[0].commentSize;
        let flags = this.data.flags;
        count++;
        //调用云函数更新评论数
        wx.cloud.callFunction({
          name: 'updateCommentSize',
          data: {
            postId: postId,
            commentSize: count,
            flag: flags,
          },
          success: res => {
            console.log("调用云函数成功，更新成功");
          },
          fail: res => {
            console.log("调用云函数失败，更新失败" + res);
          }
        })
      },
      fail: res => {

      }
    })


  },
  //点赞计数
  toLike(event) {
    var id = event.target.dataset.commentId;
    //  console.log(event);
    var status = this.data.queryResult[id].status;
    var count = this.data.queryResult[id].likedCount;
    console.log("status:" + status + "count:" + count);

    var commentStatus = 'queryResult[' + id + '].status';
    var commentCount = 'queryResult[' + id + '].likedCount';
    if (status == false) {
      count++;
      this.setData({
        [commentStatus]: true,
        [commentCount]: count
      })

    } else {
      count--;
      this.setData({
        [commentStatus]: false,
        [commentCount]: count
      })
    }
    //更新数据库信息
    this.updateLikedCount(id);
  },

  //更新数据库点赞数
  updateLikedCount(index) {

    var id = this.data.queryResult[index]._id;
    console.log("id:" + id);
    var likedCount = this.data.queryResult[index].likedCount;
    wx.cloud.callFunction({
      name: 'updateLikedCount',
      data: {
        commentId: id,
        likedCount: likedCount
      },
      success: res => {
        console.log("调用云函数成功，更新成功");
      },
      fail: res => {
        console.log("调用云函数失败，更新失败");
      }
    })
  },

  //获取用户信息
  uploadAvatar() {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        console.log(res);
        var avatarUrl = 'userInfo.avatarUrl';
        var nickName = 'userInfo.nickName';
        that.setData({
          [avatarUrl]: res.userInfo.avatarUrl,
          [nickName]: res.userInfo.nickName,
        });

      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var postId = options.id; //从上一个页面获取文章id
    var flag = options.flags; //flags
    var newCount = options.commentSize;

    //test
    console.log("comment.js ..." + postId + "," + newCount + "flags" + flag);

    this.setData({
      postId: postId,
      flags: flag
    });

    //更新未读评论
    db.collection(flag).doc(postId).update({
      data: {
        readcount: newCount
      },
      success: res => {
        console.log('[数据库] [更新记录] 成功')
      },
      fail: err => {
        icon: 'none',
          console.error('[数据库] [更新记录] 失败：', err)
      }
    })
    //查询评论记录
    this.onQuery();
    //获取用户信息
    this.uploadAvatar();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      queryResult: [],
      page: 1
    });
    this.queryPageOne();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //删除事件
  delete(event) {
    var that = this;
    // console.log(event);
    console.log("打印event事件：" + event.currentTarget.dataset.postId);
    var index = event.currentTarget.dataset.postId;
    var postId = this.data.queryResult[index]._id;
    var mainId = this.data.queryResult[index].postId;
    var flags = this.data.flags;
    //弹出模态框
    wx.showModal({
      title: '删除',
      content: '确定要删除该记录吗?',
      success: function (res) {
        if (res.confirm) {
          //点击确认，删除
          var comement = that.data.queryResult;
          comement.splice(index, 1);
          that.setData({
            queryResult: comement
          })
          const db = wx.cloud.database();
          try {
            //删除记录
            db.collection('commentList').doc(postId).remove();
            wx.cloud.callFunction({
              name: 'deleteComments',
              data: {
                _id: postId,
              },
              success: res => {
                console.log("调用云函数成功，更新成功");
              },
              fail: res => {
                console.log("调用云函数失败，更新失败" + res);
              }
            })


            db.collection(flags).where({
              _id: mainId
            }).get({
              success: res => {
                console.log(res);
                var count = res.data[0].commentSize;
                count = count - 1;
                //调用云函数更新评论数
                wx.cloud.callFunction({
                  name: 'updateCommentSize',
                  data: {
                    postId: mainId,
                    commentSize: count,
                    flag: flags,
                  },
                  success: res => {
                    console.log("调用云函数成功，更新成功");
                  },
                  fail: res => {
                    console.log("调用云函数失败，更新失败" + res);
                  }
                })
              }
            })

          } catch (e) {
            console.error(e)
          }
        } else if (res.cancel) {
          console.log("点击取消");
        }
      }
    })
  },

})