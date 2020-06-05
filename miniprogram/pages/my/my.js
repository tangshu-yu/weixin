const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hiddenButton: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
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
                app.globalData.userInfo = res.result.data.userData
                app.globalData.userId = res.result.data._id
                var Num = res.result.data.openid;
                //存储到本地会话中，监听用户是否登陆
                wx.setStorage({
                  key: "openId",
                  data: Num
                })
                wx.switchTab({
                  url: '/pages/my/my'
                })
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
  }
})