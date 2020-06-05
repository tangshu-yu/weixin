// post.js
var Bmob = require('../../utils/bmob.js');
var util = require('../../utils/util.js')
var app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    content: "", //文本内容
    userInfo: {
      avatarUrl: "", //用户头像
      nickName: "", //用户昵称
    },
    thingImage: [],
    array: ['校园百货', '学生兼职', '其他'],
    objectArray: [{
        id: 0,
        name: '校园百货'
      },
      {
        id: 1,
        name: '学生兼职'
      },
      {
        id: 2,
        name: '其他'
      },
    ],
    index: 2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {

  },
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    /**
     * 获取用户信息
     */
    wx.getUserInfo({
      success: function(res) {
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  //上传图片
  bindThingImageInput() {
    var that = this;
    if (this.data.thingImage.length < 1) {
      wx.chooseImage({
        // sizeType: ['album', 'camera'],
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          that.setData({
            thingImage: that.data.thingImage.concat(res.tempFilePaths)
          })
        }
      })
    } else {
      wx.showToast({
        title: '最多上传一张图片',
        icon:'none',
        duration: 2000
      });
    }
  },

  // 删除图片
  deleteImg: function(e) {
    var imgs = this.data.thingImage;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      thingImage: imgs
    });
  },

  //失去焦点时获取输入框内容
  bindTextAreaBlur: function(e) {
    // console.log(e.detail.value)
    let thisCount = 0; //获取到的数据
    // console.log("截取的字符为" + strInput)
    thisCount =  e.detail.value.split('\n').length - 1;
    console.log("输入的了换行符号" + thisCount)
    if (thisCount<10)
    this.setData({
      content: e.detail.value,
    })
    else{
      wx.showToast({
        title: '不能超过十行~',
        icon: 'none',
        duration: 2000
      });
    }
  },

  bindSubmit: function() {
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
      wx.showLoading({
        title: '上传中',
      })
      // console.log(userOpenId)
      var images = this.data.thingImage;
      if(images.length>0)
      for (var a = 0; a < images.length; a++) {
        console.log("图片地址：" + images[a]);
        //生成随机字符串
        var str = Math.random().toString(36).substr(2);
        console.log("随机字符串：" + str);
        const filePath = images[a];
        const cloudPath = str + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            // console.log("fileId:" + res.fileID);
            that.data.fileID = res.fileID;
            this.Addtext();
            wx.hideLoading();
          },
          fail: err => {
            wx.showToast({
              title: '发布错误',
            })
            console.log(e)
          },
          complete: () => {
          }
        })
      }
      else{
        that.data.fileID = "";
        this.Addtext();
        wx.hideLoading();
      }
    }
  },
  Addtext: function() {
    var TIME = util.formatTime(new Date());
    var that = this;
    var dataValue = {
      content: that.data.content, //工作名称
      avatarUrl: that.data.userInfo.avatarUrl, //用户头像
      nickName: that.data.userInfo.nickName, //用户匿名
      date: TIME,
      fileID: that.data.fileID, //返回图片地址
      commentSize: 0,
      readcount:0,
      index:that.data.index

    }
    //测试赋值是否成功
    console.log("测试赋值是否成功" + dataValue);
    db.collection('goodsIssue').add({
      data: dataValue,
      success: res => {
        if (res.errMsg == "cloud.uploadFile: ok")
          console.log('回调信息', dataValue)
        wx.showToast({
          title: '发布成功',
        })
        setTimeout(() => {
          wx.switchTab({
            url: '../TradeInIdleIgoods/TradeInIdleIgoods',
          })
        }, 1000)
      },
      fail: e => {
        wx.showToast({
          title: '发布错误',
        })
        console.log(e)
      }
    })

  },
})