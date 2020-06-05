//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {},
    hiddenButton:true
  },
  goToIndex: function () {
    wx.switchTab({
      url: '/pages/TradeInIdleIgoods/TradeInIdleIgoods',
    });
  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    that.isLogIn()
  },
  onShow: function () {

  },
  onReady: function () {
    var that = this;
    setTimeout(function () {
      that.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
   // 判断用户事都登陆
  isLogIn: function () {
    let _this = this
    //需要用户同意授权获取自身相关信息
    wx.getSetting({
      success: function (res) {
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
                //用户头像
                app.globalData.userInfo = res.result.data.userData
                //该用户的数据库记录ID
                app.globalData.userId = res.result.data._id
                //用户的openId
                var Num = res.result.data.openid;
                //将openId存储到本地会话中，监听用户是否登陆
                wx.setStorage({
                  key: "openId",
                  data: Num
                })
                // wx.switchTab({
                //   url: '/pages/my/my'
                // })
              } else {
                _this.setData({
                  hiddenButton: false
                })
                console.log("未注册")
              }
            },
            fail: err => {
              _this.setData({
                hiddenButton: false
              })
              wx.showToast({
                title: '请检查网络您的状态',
                duration: 800,
                icon: 'none'
              })
              console.error("get_setUserInfo调用失败", err.errMsg)
            }
          })
        } else {
          _this.setData({
            hiddenButton: false
          })
          console.log("未授权")
        }
      },
      fail(err) {
        _this.setData({
          hiddenButton: false
        })
        wx.showToast({
          title: '请检查网络您的状态',
          duration: 800,
          icon: 'none'
        })
        console.error("wx.getSetting调用失败", err.errMsg)
      }
    })
  },
  /**
     *从云端获取资料
     *如果没有获取到则尝试新建用户资料
     */
  onGotUserInfo: function (e) {
    var _this = this
    //需要用户同意授权获取自身相关信息
    if (e.detail.errMsg == "getUserInfo:ok") {
      //将授权结果写入app.js全局变量
      app.globalData.auth['scope.userInfo'] = true
      //尝试获取云端用户信息
      wx.cloud.callFunction({
        name: 'get_setUserInfo',
        data: {
          getSelf: true
        },
        success: res => {
          if (res.errMsg == "cloud.callFunction:ok")
            if (res.result) {
              //如果成功获取到
              //将获取到的用户资料写入app.js全局变量
              console.log(res)
              app.globalData.userInfo = res.result.data.userData
              app.globalData.userId = res.result.data._id
              wx.switchTab({
                url: '/pages/TradeInIdleIgoods/TradeInIdleIgoods'
              })
            } else {
              //未成功获取到用户信息
              //调用注册方法
              console.log("未注册")
              _this.register({
                nickName: e.detail.userInfo.nickName,
                gender: e.detail.userInfo.gender,
                avatarUrl: e.detail.userInfo.avatarUrl,
                region: ['none', 'none', 'none'],
                campus: "none",
                studentNumber: "none",
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
    } else
      console.log("未授权")
  },
  /**
   * 注册用户信息
   */
  register: function (e) {
    let _this = this
    wx.cloud.callFunction({
      name: 'get_setUserInfo',
      data: {
        setSelf: true,
        userData: e
      },
      success: res => {
        if (res.errMsg == "cloud.callFunction:ok" && res.result) {
          _this.setData({
            hiddenButton: true
          })
          app.globalData.userInfo = e
          app.globalData.userId = res.result._id
          _this.data.registered = true
          console.log(res)
          wx.navigateTo({
            url: '/pages/my/my'
          })
        } else {
          console.log("注册失败", res)
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
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
  }
});