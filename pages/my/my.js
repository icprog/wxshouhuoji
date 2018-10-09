var Request = require('../../Utils/Request.js');
var app = getApp()
// var userInfo = getApp().getUserInfo()
var userInfo = null
var isPayDeposit = false
var depositButtonCanClick = true
Page({
  data: {
    userInfo: userInfo,
    wx_userInfo:'',
    my_items: [
      {
        'icon': '../../image/ZHIFU.png',
        'title': '交99押金',
        'subTitle': '',
      }
    ],
    isPayDeposit: isPayDeposit
  },
  gotoLogin: function (e) {
    wx.navigateTo({
      url: '../mobileLogin/mobileLogin',
    })
  },
  deposit: function (e) {
    if(!depositButtonCanClick){
      return;
    }
    if (isPayDeposit) {
      var that = this
      console.log('关闭')
      if (userInfo){
        wx.showModal({
          title: '退押金',
          content: '您确定退押金吗？',
          confirmText: '不退了',
          cancelText: '退押金',
          success: (result) => {
            if (!result.confirm) {
              that.closeDeposit()
            }
          },
        });
      }else{
        that.gotoLogin()
      }
    } else {
      depositButtonCanClick = false;
      this.payDeposit()
      // wx.showModal({
      //   title: '提示',
      //   content: '发现您是“路上”会员，不用交纳押金即可购物',
      //   confirmText: '去购物',
      //   cancelText: '取消',
      //   success: (result) => {
      //     if (result.confirm) {
      //       wx.navigateBack({

      //       })
      //     }
      //   },
      // });
      console.log('开通')
    }
  },
  myOrder: function (e) {
    if (app.userInfo) {
      wx.navigateTo({
        url: '../orderList/orderList',
      })
    } else {
      wx.navigateTo({
        url: '../mobileLogin/mobileLogin',
      })
    }

  },
  myAppeal: function (e) {
    if (app.userInfo) {
      wx.navigateTo({
        url: '../appealList/appealList',
      })
    } else {
      wx.navigateTo({
        url: '../mobileLogin/mobileLogin',
      })
    }
  },
  loginOut: function (e) {
    if (userInfo == null) {
      wx.navigateTo({
        url: '../mobileLogin/mobileLogin',
      })
      return;
    }
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否退出',
      confirmText: '退出',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          try {
            wx.setStorageSync('userInfo', null)
            that.setData({
              isPayDeposit:false
            })
            isPayDeposit:false
          } catch (e) {
          }

          app.getUserInfo()
          userInfo = app.userInfo
          console.log('退出')
          console.log(userInfo)
          that.setData({
            userInfo: userInfo,
          })
          wx.navigateTo({
            url: '../mobileLogin/mobileLogin',
          })
        }
      },
    });
  },
  onLoad() {

  },
  onShow() {
    var that = this
    userInfo = app.userInfo
    console.log(userInfo)
    that.setData({
      userInfo: userInfo,
    })
    console.log(isPayDeposit)
    let wx_userInfo = wx.getStorageSync('wx_userInfo')
    if (userInfo && (userInfo.headimg.length == 0 || !userInfo.headimg)&&wx_userInfo) {
      userInfo.headimg = wx_userInfo.avatarUrl
      this.setData({
        userInfo: userInfo
      })
    }
    console.log(wx_userInfo)
    // 页面显示
    if (userInfo) {
      this.queryIsPayDeposit();
    }
  },
  queryIsPayDeposit: function () {
    var that = this
    Request.queryDeposit(function (res) {
      if (res.code == '0') {
        isPayDeposit = true
        that.setData({
          isPayDeposit: isPayDeposit
        })
      } else {
        isPayDeposit = false
        that.setData({
          isPayDeposit: isPayDeposit
        })
      }
      console.log(isPayDeposit)
    }, function () {

    })
  },

  closeDeposit: function () {
    var that = this
    Request.closeDeposit(function (res) {
      that.queryIsPayDeposit();
    }, function () {

    }
    );
  },
  payDeposit: function () {
    var that = this
    Request.payDeposit(function (res) {
      depositButtonCanClick = true;
      setTimeout(function () {
        wx.showToast({
          title: "交纳押金成功",
          icon: 'none',
          duration: app.showToastDuring
        });
      }, app.delayTime)
      
      that.queryIsPayDeposit()
    }, function () {
      depositButtonCanClick = true;
      setTimeout(function () {
        wx.showToast({
          title: "交纳失败",
          icon: 'none',
          duration: app.showToastDuring
        });
      }, app.delayTime)
      
    })
  }
});
