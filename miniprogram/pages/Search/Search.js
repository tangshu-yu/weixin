// pages/search/search.js
var db = wx.cloud.database(); //初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchVal: "",
    //搜索过后商品列表
    queryResult: [],

    countGoods:null,

    countnew:null,

    page: 1,

    pageSize: 20,

    flag: true,

    flagss:false,

    options: "goodsIssue"
  },
  input(e) {
    this.setData({
      searchVal: e.detail.value
    })
    // console.log(e.detail.value)
  },
  clear: function() {
    this.setData({
      searchVal: "",
      flagss:false
    })
  },
  //商品关键字模糊搜索
  search: function() {
    wx: wx.showLoading({
      title: '加载中',
      mask: false,
    })
    //重新给数组赋值为空
    this.setData({
      queryResult: [],
      flagss:true
    })
    var option = this.data.options
    var pageSize = this.data.pageSize;
    this.data.page=2;
      db.collection(option).where({
        //使用正则查询，实现对搜索的模糊查询
        content: db.RegExp({
          regexp: this.data.searchVal,
          //从搜索栏中获取的value作为规则进行匹配。
          options: 'i',
          //大小写不区分
        })
      }).limit(pageSize).orderBy('date', 'desc').get({
        success: res => {
          console.log(res)
          wx.hideLoading();
          this.setData({
            queryResult: this.data.queryResult.concat(res.data),
          })
          console.log("数据为：" + this.data.queryResult.length)
        }
      })
    db.collection(option).where({
      content: db.RegExp({
        regexp: this.data.searchVal,
        options: 'i',
      })
    }).count({
      success: res => {
        this.setData({
          countGoods: res.total
        })
        console.log("物品总计" + res.total)
      }
      , fail: res => {
        console.log("获取失败：" + res.errMsg)
      }
    })
  },
 /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.title == "goodsIssue") {
      this.setData({
        flag: true
      })
      this.onQuery()
      console.log(this.data.options + this.data.flag)
    } else {
      this.data.options = "LostIssue"
      this.setData({
        flag: false
      })
      this.onQuery()
      console.log(this.data.options + this.data.flag)
    }
  },

  /**
  
   * 第一页查询
  
   */

  queryPageOne: function () {

    const db = wx.cloud.database();

    var that = this;

    var option = this.data.options

    //页码

    var pageNum = that.data.page;

    //一页的记录数1gf

    var pageSize = that.data.pageSize;

    db.collection(option).limit(pageSize).orderBy('date', 'desc').get({

      success: res => {
        this.setData({
          //微信小程序 实现合并对象 concat
          queryResult: this.data.queryResult.concat(res.data),
          page: pageNum + 1

        })
        console.log('[数据库] [查询记录] 成功: ', this.data.queryResult.concat(res.data));

      },
      fail: err => {

        wx.showToast({

          icon: 'none',

          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    db.collection(option).count({
      success: res => {
        this.setData({
          countGoods: res.total
        })
        console.log("总的物品总计" + res.total)
      }
      , fail: res => {
        console.log("获取失败：" + res.errMsg)
      }
    })
  },

  /**
  
   * 分页查询 不是第一页使用这个方法
  
   */

  queryByPage: function () {
    const db = wx.cloud.database();
    var that = this;
    var pageNum = that.data.page;
    var pageSize = that.data.pageSize;
    var option = this.data.options
    var res = that.data.queryResult;
    // 查询当前用户所有的 goodsIssue
    console.log("key" + this.data.searchVal)
    db.collection(option).where({
      //使用正则查询，实现对搜索的模糊查询
      content: db.RegExp({
        regexp: this.data.searchVal,
        //从搜索栏中获取的value作为规则进行匹配。
        options: 'i',
        //大小写不区分
      })
    }).skip((pageNum - 1) * pageSize).limit(pageSize).orderBy('date', 'desc').get({

      success: res => {
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


  onQuery: function () {

    var pageNum = this.data.page;

    if (pageNum == 1&&!this.data.flagss) {

      this.queryPageOne();

    } else {

      this.queryByPage();

    }

  },

  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {

    //获取最新记录
    this.setData({
      page: 1,
      queryResult: [],
    });
    console.log("更新后的page:" + this.data.page)
    this.search();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
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
   * 跳转到文章评论页面
   */
  onTapToCommentLost(event) {
    //获取postId
    var postId = event.currentTarget.dataset.postId;
    wx.navigateTo({
      url: '/pages/LostPropertyInquiry/comment/comment?id=' + postId,
    })
  },
  
   /**
   * 跳转到文章评论页面
   */
  onTapToCommentGoods(event) {
    //获取postId
    var postId = event.currentTarget.dataset.postId;
    wx.navigateTo({
      url: '/pages/TradeInIdleIgoods/comment/comment?id=' + postId,
    })
  },
})