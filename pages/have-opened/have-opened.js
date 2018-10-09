var Request = require('../../Utils/Request.js');
var count = 0;
var orderNo = '';
var app = getApp()
var userInfo
var isMember = 'false'
Page({
  data: {
    message: '正在开门,请稍后',
    sub_message: '',
    isMember:isMember
  },
  onLoad(query) {
    userInfo = app.userInfo
    isMember = query.isMember
    console.log(isMember)
    this.setData({
      backgroundImage: app.dateImage,
      isMember:isMember
    })
    orderNo = query.orderNo
    console.log('orderNo = ' + orderNo)
    if (query.open_type == '1') {
      this.pollingOrderUrl()
    } else {
      this.pollingReplenshment();
    }
  },
  pollingOrderUrl: function () {
    console.log(count++)
    var that = this
    var url = app.globalData.servel_url + 'orderDetail'
    console.log(url)
    var params = {
      uid: userInfo.uid,
      token: userInfo.token,
      orderNo: orderNo,
    }
    Request.request(url, params, '', function (res) {
      console.log(res.data)
      var orderState = res.data.orderState
      console.log("订单状态："+orderState)
      var message
      var sub_message = ''
      // var isMember = res.data.isCk == '1'
      if (orderState == 2) {
        message = '门已开,请放心拿取'
        if (isMember == 'true') {
          sub_message = "关门后会自动按照会员价结算"
        }
      } else if (orderState == 3) {
        message = '由于机器故障,开门失败'
        sub_message = ''
      } else if (orderState == 9 || orderState == 10) {
        wx.showLoading({
          title: '正在结算',
        });
        message = '门已关,正在结算'
        sub_message = ''
      } else if (!(orderState == 1)) {
        message = '生成订单成功'
        sub_message = ''
      }
      that.setData({
        message: message,
        isMember: isMember,
        sub_message: sub_message
      })
      console.log('message = ' + message);
      if (orderState == 1 || orderState == 2 || orderState == 9 || orderState == 10) {
        setTimeout(function () {
          //要延时执行的代码  
          that.pollingOrderUrl()
        }, 1000) //延迟时间 这里是1秒  
      } else {
        if (res.data.fault && res.data.fault != ''){
          wx.showModal({
            title: '提示',
            content: '由于机器发生故障,订单暂时无法结算',
            confirmText: '确定',
            // cancelText: '退出',
            showCancel:false,
            success: (result) => {
              wx.navigateBack({

              })
            },
          });
          return
        }
        if (orderState != 3) {
          wx.hideLoading();
          wx.navigateTo({
            url: '../orderDetail/orderDetail?orderData=' + JSON.stringify(res.data) + '&fromType=opendoor',
          })
        }else if(orderState == 3){
          wx.showModal({
            title: '提示',
            content: '由于机器故障，开门失败',
            confirmText: '确定',
            // cancelText: '退出',
            showCancel:false,
            success: (result) => {
              wx.navigateBack({

              })
            },
          });
        }
        return
      }
    }, function () {
      setTimeout(function () {
        //要延时执行的代码  
        that.pollingOrderUrl()
      }, 1000)
    }
    );
  },
});
