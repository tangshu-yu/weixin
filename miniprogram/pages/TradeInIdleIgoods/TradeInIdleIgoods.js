// pages/TradeInIdleIgoods/TradeInIdleIgoods.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    click: true,
    imgArr: [],

    queryResult: [],

    queryData: [],

    tempImagePath: "",

    page: 1,

    pageSize: 20,

    flags: 'all',

    countGoods:null,

    // 首页的轮播图
    imgUrls: [
      "/images/shouye/school.jpg",
      "/images/shouye/lunbotu6.jpg",
      "/images/shouye/lunbotu3.png",
      "/images/shouye/lunbotu2.png",
    ],
    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    duration: 1000, //滑动动画时长
  },
  //点击校园百货响应事件
  Supermarket() {
    this.setData({
      flags: 'market'
    })
    wx.showToast({
      title: '下拉即可显示全部信息',
      icon: 'none',
      duration: 1000
    })
  },
  //点击学生兼职响应事件
  ParttimeJob() {
    this.setData({
      flags: 'job'
    })
    wx.showToast({
      title: '下拉即可显示全部信息',
      icon: 'none',
      duration: 1000
    })
  },
  //图片预览
  previewImg: function(e) {
    var index = e.currentTarget.dataset.index;
    var imgArr = this.data.queryResult[index].fileID;
    var imgs = this.data.imgArr;
    imgs.push(imgArr);
    wx.previewImage({
      current: imgArr, //当前图片地址
      urls: imgs, //所有要预览的图片的地址集合 数组形式
    });
  },
  //查询数据

  onQuery: function() {

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

  queryPageOne: function() {

    const db = wx.cloud.database();

    var that = this;

    //页码

    var pageNum = that.data.page;

    //一页的记录数1gf

    var pageSize = that.data.pageSize;

    //queryREsult

    var res = that.data.queryResult;

    // 查询当前用户所有的 counters

    db.collection('goodsIssue').limit(pageSize).orderBy('date', 'desc').get({
      success: res => {
        this.setData({
          //微信小程序 实现合并对象 concat
          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1
        })
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
    db.collection('goodsIssue').count({
      success: res => {
        this.setData({
          countGoods: res.total
        })
        console.log("丢失物品总计" + res.total)
      }
      , fail: res => {
        console.log("获取失败：" + res.errMsg)
      }
    })
  },

  /**
  
   * 分页查询 不是第一页使用这个方法
  
   */

  queryByPage: function() {

    const db = wx.cloud.database();

    var that = this;

    //页码

    var pageNum = that.data.page;

    //一页的记录数1gf

    var pageSize = that.data.pageSize;

    //queryREsult

    var res = that.data.queryResult;

    // 查询当前用户所有的 goodsIssue

    db.collection('goodsIssue').skip((pageNum - 1) * pageSize).limit(pageSize).orderBy('date', 'desc').get({

      success: res => {
        //追加数据
        this.setData({
          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1
        })
        console.log('[数据库] [查询记录] 成功: ', this.data.queryResult);

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



  //下载图片内容

  downloadImageContent() {

    var postList = this.data.queryResult;

    for (var i = 0; i < postList.length; i++) {
      if (postList[i].Types == 0) {
        console.log("test fileId " + i + postList[i].fileID);
        wx.cloud.downloadFile({
          fileID: postList[i].fileID,
          success: res => {
            console.log("临时路径：" + res.tempFilePath);
            var tempPath = 'postList[' + i + '].fileID';
            this.setData({
              [tempPath]: res.tempFilePath
            })
            console.log();
          }
        })
      } else
        continue;
    }

  },
  /**

  * 跳转到文章评论页面

  */

  onTapToComment(event) {

    //获取postId

    var postId = event.currentTarget.dataset.postId;

    console.log(postId);

    wx.navigateTo({

      url: 'comment/comment?id=' + postId,

    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this
    //需要用户同意授权获取自身相关信息
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          //将授权结果写入app.js全局变量
          app.globalData.auth['scope.userInfo'] = true
          //从云端获取用户资料
          wx.cloud.callFunction({
            name: 'get_setUserInfo',
            data: {
              getSelf: true
            },
            success: res => {
              if (res.errMsg == "cloud.callFunction:ok" && res.result) {
                //如果成功获取到
                //将获取到的用户资料写入app.js全局变量
                console.log(res)
                app.globalData.userInfo = res.result.data.userData
                app.globalData.userId = res.result.data._id
                var Num = res.result.data.openid;
                //存储到本地会话中，监听用户是否登陆
                wx.setStorage({
                  key: "openId",
                  data: Num
                })
              }
            },
            fail: err => {
              wx.showToast({
                title: '请检查网络您的状态',
                duration: 800,
                icon: 'none'
              })
              console.error("get_setUserInfo调用失败", err.errMsg)
            }
          })
        } else {
          wx.switchTab({
            url: '/pages/my/my'
          })
          console.log("未授权")
        }
      },
      fail(err) {
        wx.showToast({
          title: '请检查网络您的状态',
          duration: 800,
          icon: 'none'
        })
        console.error("wx.getSetting调用失败", err.errMsg)
      }
    })
    this.onQuery();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    //获取最新记录

    if (this.data.flags!='all'){
      this.setData({
        flags: 'all'
      })
      wx.stopPullDownRefresh();
    }
    else {
      this.setData({

        page: 1,

        queryResult: [],

        flags: 'all'

      });
      console.log("更新后的page:" + this.data.page)
      this.queryPageOne();
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.countGoods == this.data.queryResult.length) {
      wx.showToast({
        title: '到底了~',
        icon: 'none',
        duration: 2000
      });
    } else
      this.onQuery();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

    }
    ,
  //搜索功能
  bindSearchBook() {
    wx.navigateTo({
      url: '../Search/Search',
    })
  }
})