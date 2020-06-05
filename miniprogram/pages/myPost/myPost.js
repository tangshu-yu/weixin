// pages/myPost/myPost.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //导航栏数据初始化
    postThing: true,
    postLost: false,
    //二手物品
    queryResult: [],
    quertLost: [],
    imgArr: [],
    countLost: null,
    countGoods: null,
    //标志位
    flags: "goodsIssue",
    tempImagePath: "",
    page: 1,
    pageSize: 20,
  },
  //导航栏的响应事件
  choosePostThing: function (e) {
    var that = this;
    that.setData({
      postThing: true,
      postLost: false,
      flags: "goodsIssue",
    })
  },
  choosePostLost: function (e) {
    var that = this;
    that.setData({
      postThing: false,
      postLost: true,
      flags: "LostIssue",
    })
  },

  previewImg: function (e) {

    var index = e.currentTarget.dataset.index;

    var imgArr = this.data.queryResult[index].fileID;

    var imgs = this.data.imgArr;

    imgs.push(imgArr);
    wx.previewImage({

      current: imgArr, //当前图片地址

      urls: imgs, //所有要预览的图片的地址集合 数组形式

    });

  },
  /**
   * 跳转到文章评论页面二手物品
   */
  onTapToCommentGoods(event) {
    //获取postId
    // var postId = event.currentTarget.dataset.postId;
    
    var index = event.currentTarget.dataset.postId;
    var postId = this.data.queryResult[index]._id;
    var cunt = this.data.queryResult[index].commentSize
    console.log("评论数为："+cunt)
    wx.navigateTo({
      url: 'comment/comment?id=' + postId + '&flags=' + this.data.flags+'&commentSize='+cunt,
    })
  },
    /**
   * 跳转到文章评论页面丢失捡到
   */
  onTapToCommentLost(event) {
    //获取postId
    var index = event.currentTarget.dataset.postId;
    var postId = this.data.quertLost[index]._id;
    var cunt = this.data.quertLost[index].commentSize
    wx.navigateTo({
      url: 'comment/comment?id=' + postId + '&flags=' + this.data.flags+'&commentSize='+cunt,
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
  /**
   * 第一页查询
   */
  queryPageOne: function () {
    const db = wx.cloud.database();
    var that = this;

    let userOpenId = wx.getStorageSync('openId')

    if (!userOpenId) {
      wx.showModal({
        title: '提示',
        content: '您还未登录,请先登录~',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '../my/my',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
    //页码
    var pageNum = that.data.page;
    //一页的记录数1gf
    var pageSize = that.data.pageSize;
    var flag = that.data.flags;
    // 查询当前用户所有的 counters
    db.collection('goodsIssue').where({
      _openid: userOpenId
    }).limit(pageSize).orderBy('date', 'desc').get({
      success: res => {
        console.log('查询到的数据1：', res.data)
        this.setData({
          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1
        })
        console.log("标志位" + flag)
        //下载图片内容
        // this.downloadImageContent(res.data);
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

    db.collection('LostIssue').where({
      _openid: userOpenId
    }).limit(pageSize).orderBy('date', 'desc').get({
      success: res => {
        console.log('查询到的数据1：', res.data)
        this.setData({
          quertLost: this.data.quertLost.concat(res.data),
          page: pageNum + 1
        })
        console.log("标志位" + flag)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

    //获当前用户取遗失物品条数

    db.collection('LostIssue').where({
      _openid: userOpenId // 填入当前用户 openid
    }).count({
      success: res => {
        this.setData({
          countLost: res.total
        })
        console.log("丢失物品总计" + res.total)
      },
      fail: res => {
        console.log("获取失败：" + res.errMsg)
      }
    })

    //获当前用户发布用品总数
    db.collection('goodsIssue').where({
      _openid: userOpenId // 填入当前用户 openid
    }).count({
      success: res => {
        this.setData({
          countGoods: res.total
        })
        console.log("丢失物品总计" + res.total)
      },
      fail: res => {
        console.log("获取失败：" + res.errMsg)
      }
    })

  }
  },
  /**
   * 分页查询 不是第一页使用这个方法
   */
  queryByPage: function () {
    const db = wx.cloud.database();
    var that = this;
    var openid;
    //获取本地缓存中的openID
    wx.getStorage({
      key: "openId",
      success: function (res) {
        console.log("登陆缓存" + res.data)
        openid = res.data;

      }
    })
    //页码
    var pageNum = that.data.page;
    //一页的记录数1gf
    var pageSize = that.data.pageSize;
    //queryREsult
    var res = that.data.queryResult;
    var flag = that.data.flags;
    // 查询当前用户所有的 counters
    db.collection(flag).where({
      _openid: openid
    }).skip((pageNum - 1) * pageSize).limit(pageSize).orderBy('date', 'desc').get({
      success: res => {
        //追加数据
        // this.data.queryResult.unshift(res.data);
        if (flag == "goodsIssue") {
          this.setData({
            // queryResult: JSON.stringify(res.data, null, 2)
            queryResult: this.data.queryResult.concat(res.data),
            page: pageNum + 1
          })
        } else {
          this.setData({
            quertLost: this.data.quertLost.concat(res.data),
            page: pageNum + 1
          })
        }
        console.log('[数据库] [查询记录] 成功: ', res.data);
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
  //删除事件
  delete(event) {
    var that = this;
    // console.log(event);
    // console.log("打印event事件：" + event.currentTarget.dataset.postId);
    var flag = that.data.flags;
    if (flag == "goodsIssue") {
      var index = event.currentTarget.dataset.postId;
      var postId = this.data.queryResult[index]._id;
      var fileId = this.data.queryResult[index].fileID
    } else {
      var index = event.currentTarget.dataset.postId;
      var postId = this.data.quertLost[index]._id;
      var fileId = this.data.quertLost[index].fileID

    }

    console.log("点击删除" + postId + "文件ID" + fileId);
    //弹出模态框
    wx.showModal({
      title: '删除',
      content: '确定要删除该记录吗?',
      success: function (res) {
        if (res.confirm) {
          //点击确认，删除
          if (flag == "goodsIssue") {
            var postList = that.data.queryResult;
            postList.splice(index, 1);
            that.setData({
              queryResult: postList
            })
          } else {
            var postList = that.data.quertLost;
            postList.splice(index, 1);
            that.setData({
              quertLost: postList
            })
          }

          const db = wx.cloud.database();
          try {
            //删除记录
            db.collection(flag).doc(postId).remove();


            //通过postid删除评论 云函数
            wx.cloud.callFunction({
              name: "deleteComments",
              data: {
                postId: postId
              },
              success: res => {
                console.log("调用云函数成功，删除成功");
              },
              fail: res => {
                console.log("调用云函数失败，删除失败");
              }
            })

            //删除数据库中的图片
            wx.cloud.deleteFile({
              fileList: [fileId],
              success: res => {
                console.log(res.fileList)
              },
              fail: console.error
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onQuery();

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    //获取最新记录
    this.setData({
      page: 1,
      queryResult: [],
      quertLost: []

    });
    console.log("更新后的page:" + this.data.page)
    this.queryPageOne();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.flags == 'goodsIssue')
      if (this.data.countGoods == this.data.queryResult.length) {
        wx.showToast({
          title: '到底了~',
          icon: 'none',
          duration: 2000
        });
      } else
        this.onQuery();
    else {
      if (this.data.countLost == this.data.quertLost.length) {
        wx.showToast({
          title: '到底了~',
          icon: 'none',
          duration: 2000
        });
      } else
        this.onQuery();
    }


  }
})