// pages/TradeInIdleIgoods/TradeInIdleIgoods.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    click: true,
    imgArr: [],

    queryResult: [],

    tempImagePath: "",

    page: 1,

    pageSize: 20,

    countGoods:null,

    activeNav: 'all',
    navs: [{
        text: '全部 ',
        alias: 'all'
      }, {
        text: '丢失物品',
        alias: 'lost'
      }, {
        text: '拾到物品',
        alias: 'pick'
      },
      {
        text: '发布与搜索',
        alias: 'send'
      },
    ]

  },

  changeList(e) {
    console.log(e.target.dataset.alias);
    const that = this;
    const alias = e.target.dataset.alias;

    if (alias !== this.data.activeNav) {
      this.setData({
        activeNav: e.target.dataset.alias,
      });
    }
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

    db.collection('LostIssue').limit(pageSize).orderBy('date', 'desc').get({

      success: res => {
        this.setData({

          // queryResult: JSON.stringify(res.data, null, 2)

          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1

        })

        console.log('[数据库] [查询记录] 成功: ', res.data);



        //下载图片内容

        // this.downloadImageContent();

      },

      fail: err => {

        wx.showToast({

          icon: 'none',

          title: '查询记录失败'

        })

        console.error('[数据库] [查询记录] 失败：', err)

      }

    })

    //获当前用户发布用品总数
    db.collection('LostIssue').count({
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

    // 查询当前用户所有的 counters

    db.collection('LostIssue').skip((pageNum - 1) * pageSize).limit(pageSize).orderBy('date', 'desc').get({

      success: res => {

        //追加数据

        // this.data.queryResult.unshift(res.data);

        this.setData({

          // queryResult: JSON.stringify(res.data, null, 2)

          queryResult: this.data.queryResult.concat(res.data),

          page: pageNum + 1

        })

        console.log('[数据库] [查询记录] 成功: ', this.data.queryResult);

        //下载图片内容

        // this.downloadImageContent();

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
    }
  },
  //下载云数据库的图片

  downImage: function(fileId) {

    wx.cloud.downloadFile({

      fileID: 'cloud://d-24c49d.642d-d-24c49d/my-image.jpg', // 文件 ID

      success: res => {

        // 返回临时文件路径

        console.log(res.tempFilePath);

        this.setData({

          tempImagePath: res.tempFilePath

        })

      },

      fail: console.error

    })

  },

  /**
   * 跳转到文章评论页面
   */
  onTapToComment(event) {
    //获取postId
    var postId = event.currentTarget.dataset.postId;
    wx.navigateTo({
      url: 'comment/comment?id=' + postId,
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //隐藏底部导航栏 wx.hideTabBar({});
    //查询数据

    // onQuery();

    this.onQuery();

    //  this.downImage();

    // 查看是否授权,授权登陆

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

    this.setData({

      page: 1,

      queryResult: []

    });

    console.log("更新后的page:" + this.data.page)

    this.queryPageOne();

    wx.stopPullDownRefresh();
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

  },

})