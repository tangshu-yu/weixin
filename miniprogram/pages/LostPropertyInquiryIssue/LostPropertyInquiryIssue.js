// pages/LostPropertyInquiryIssue/LostPropertyInquiryIssue.js
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
    markers: [],
    index: 0,
    date: '2017-01-01',
    isChecked: true,
    isChecksd: false,
    labels: "丢失日期",
    openid: 0,
    imglist: [],
    item: '../../image/LostPageIssue/upic.png',
    loading: false,
    disabled: false,
    loadingHide: true,
    fileID: "",
    text: '',
    data: [],
    imgUrl: '',
    userInfo: {
      avatarUrl: "", //用户头像
      nickName: "", //用户昵称
    },
  },

  diushi: function() {
    this.setData({
      isChecksd: false,
      isChecked: true,
      labels: "丢失日期"
    })
  },
  jiandao: function() {
    this.setData({
      isChecked: false,
      isChecksd: true,
      labels: "捡到日期"
    })
  },
  /**
   *输入的文字
   */
  textInput: function(e) {
    let thisCount = 0; //获取到的数据
    thisCount = e.detail.value.split('\n').length - 1;
    console.log("输入的了换行符号" + thisCount)
    if (thisCount < 10)
      this.setData({
        text: e.detail.value,
      })
    else {
      wx.showToast({
        title: '不能超过十行~',
        icon: 'none',
        duration: 2000
      });
    }
  },
  /**
   *图片上传函数
   */
  uploadImgHandle: function() {
    self = this
    if (this.data.imglist.length < 1) {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          var tempFilePaths = res.tempFilePaths
          self.setData({
            imglist: tempFilePaths
          })
        }
      })
    } else {
      wx.showToast({
        title: '最多上传一张图片',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 删除图片
  deleteImg: function(e) {
    var imgs = this.data.imglist;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imglist: imgs
    });
  },
  /**
   *提交函数
   */
  submit: function() {
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
    if (this.data.imglist.length > 0){
      let filePath = this.data.imglist[0];
      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
      wx.cloud.uploadFile({
        cloudPath: new Date().getTime() + suffix,
        filePath: filePath, // 文件路径
        success: res => {
          this.Addtext(res.fileID);
          wx.hideLoading();

          console.log('返回信息', res)
        },
        fail: err => {
          // handle error
        }
      })
    }
    else {
      this.Addtext("");
    }
  }
  },

  Addtext: function(fileId) {
    var TIME = util.formatTime(new Date());
    var data = {
      content: this.data.text,
      labels: this.data.labels,
      fileID: fileId,
      isChecked: this.data.isChecked,
      avatarUrl: this.data.userInfo.avatarUrl,
      nickName: this.data.userInfo.nickName,
      date: TIME,
      commentSize: 0,
      readcount:0
    }
    console.log('上传信息', data)

    if (data.content) {
      db.collection('LostIssue').add({
        data: data,
        success: res => {
            console.log('回调信息', data)
          wx.showToast({
            title: '发布成功',
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../LostPropertyInquiry/LostPropertyInquiry',
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
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //用户头像
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示 监听用户登陆
   */
  onShow: function() {
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
      console.log(userOpenId)
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    wx.showToast({
      title: '到底了~',
      icon: 'none'
    })
    setTimeout(() => {}, 1500)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})