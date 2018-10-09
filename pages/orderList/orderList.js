var Request = require('../../Utils/Request.js');
var app = getApp();
var pageSize = 10;
var daizhifu = [];
var daizhifuPageNo = 0
var button_type = '0'
var allList = []
var allPageNo = 0
var isRequest = 0 //0没有请求，1请求成功，2请求失败
Page({
  data: {
    orderList: allList,
    list_type: button_type,
    isRequest: isRequest
  },
  onUnload() {
    // 页面被关闭
    daizhifu = [];
    button_type = '0'
    allList = []
    daizhifuPageNo = 0;
    allPageNo = 0
    isRequest = 0
  },
  onLoad() {
    var windowH = wx.getSystemInfoSync().windowHeight
    var windowW = wx.getSystemInfoSync().windowWidth
    var height = windowH - 50
    var image_width = (windowW - 32) / 3;
    console.log(height)
    this.setData({
      scroll_height: height,
      image_width: image_width
    })
    this.reloadData()
  },
  onShow() {
    if (app.isRefreshOrderList) {
      this.reloadData();
      app.isRefreshOrderList = false
    }
  },
  onPullDownRefresh() {
    console.log('onPullDownRefresh', new Date())
    this.reloadData();
  },
  topClick: function (e) {
    button_type = e.currentTarget.dataset.type;
    var list = button_type == "0" ? allList : daizhifu
    this.setData({
      list_type: button_type,
      orderList: list
    })
  },
  gotopurchase: function (e) {
    var orderList = button_type == '0' ? allList : daizhifu
    var orderData = orderList[e.currentTarget.dataset.index]
    var that = this;
    var orderNo = orderData.orderNo
    var amount = orderData.payAmount
    Request.payOrder(orderNo, amount, '会员柜订单:' + orderNo, function (res) {
      that.reloadData()
    }, function () {

    })


    //   my.showLoading({
    //    content: '正在获取支付信息',
    //   });
    //   my.httpRequest({
    //    url: url,
    //    method: 'POST',
    //    data: {
    //      outtradeno: orderNo,
    //      subject: '美食吧订单:'+orderNo,
    //      totalAmount:orderData.payAmount,
    //      type : 'MINI'
    //    },
    //   dataType: 'json',
    //   success: function(res) {
    //     my.hideLoading();
    //     console.log(res.data)
    //     // if(res.data.code == '0'){
    //        my.tradePay({
    //          orderStr: res.data.data, //完整的支付参数拼接成的字符串，从服务端获取
    //          success: (res) => {
    //            my.showToast({
    //               content: '支付成功',
    //            })
    //            that.reloadData()
    //       },
    //       fail: (res) => {

    //       }
    //     });
    //   },
    //   fail: function(res) {
    //     my.hideLoading();
    //     my.showToast({
    //       content: '获取支付信息失败',
    //     })
    //   },
    //   complete: function(res) {
    //     my.hideLoading();
    //   }
    //  });
  },
  cellClick: function (e) {
    var orderList = button_type == '0' ? allList : daizhifu
    var detail = orderList[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderNo=' + detail.orderNo + '&fromType=list',
    })
  },
  lowerRefresh: function () {
    console.log('加载更多')
    var that = this
    var url = app.globalData.servel_url + 'indentOrderList'
    isRequest = 0
    this.setData({
      isRequest: isRequest,
    })
    var pageNo = (button_type == '0') ? ++allPageNo : ++daizhifuPageNo
    console.log(pageNo)
    var params = {
      uid: app.userInfo.uid,
      token: app.userInfo.token,
      pageNo: pageNo,
      pageSize: pageSize,
      queryState: (button_type == '0') ? '1' : '2'
    }
    Request.request(url, params, '', function (res) {
      wx.stopPullDownRefresh()
      isRequest = 1
      that.setData({
        isRequest: isRequest
      })
      console.log(res.data);
      if (res.code == '0') {
        if (button_type == '0') {
          for (var i = 0; i < res.data.length; i++) {
            allList.push(res.data[i]);
          }
        } else {
          for (var i = 0; i < res.data.length; i++) {
            daizhifu.push(res.data[i]);
          }
        }
        that.setData({
          orderList: (button_type == '0') ? allList : daizhifu
        })
      }
    },
      function () {
        wx.stopPullDownRefresh()
        isRequest = 2
        that.setData({
          isRequest: isRequest
        })
        setTimeout(function () {
          wx.showToast({
            title: '请求失败',
            icon: 'none',
            duration: app.showToastDuring
          })
        }, app.delayTime)

      }
    )
  },
  reloadData: function () {
    allPageNo = 0
    daizhifuPageNo = 0
    this.queryOrderList("1");
    this.queryOrderList("2");
    // var that = this
    // var url = app.globalData.servel_url + 'indentOrderList'
    // var params = {
    //   uid: app.userInfo.uid,
    //   token: app.userInfo.token,
    //   pageNo: 0,
    //   pageSize: pageSize,
    //   queryState: (button_type == '0') ? '1' : '2'
    // }
    // isRequest = 0
    // this.setData({
    //   isRequest: isRequest,
    //   // orderList: []
    // })
    // Request.request(url, params, '加载中', function (res) {
    //   wx.stopPullDownRefresh()
    //   isRequest = 1
    //   that.setData({
    //     isRequest: isRequest
    //   })
    //   if (res.code == '0') {
    //     if (button_type == '0') {
    //       allList = res.data;
    //     } else {
    //       daizhifu = res.data;
    //     }
    //     that.setData({
    //       orderList: (button_type == '0') ? allList : daizhifu
    //     })
    //   }
    // }, function () {
    //   wx.stopPullDownRefresh()
    //   isRequest = 2
    //   that.setData({
    //     isRequest: isRequest,
    //     orderList: []
    //   })
    //   setTimeout(function () {
    //     wx.showToast({
    //       title: '请求失败',
    //       icon: 'none',
    //       duration: app.showToastDuring
    //     })
    //   }, app.delayTime)

    // }
    // );
  },
  queryOrderList: function (queryState) {
    var that = this
    var url = app.globalData.servel_url + 'indentOrderList'
    var params = {
      uid: app.userInfo.uid,
      token: app.userInfo.token,
      pageNo: 0,
      pageSize: pageSize,
      queryState: queryState
    }
    isRequest = 0
    this.setData({
      isRequest: isRequest,
    })
    Request.request(url, params, '加载中', function (res) {
      wx.stopPullDownRefresh()
      isRequest = 1
      that.setData({
        isRequest: isRequest
      })
      if (res.code == '0') {
        if (queryState == '1') {
          allList = res.data;
          if (button_type == '0') {
            that.setData({
              orderList: allList
            })
          }
        } else {
          daizhifu = res.data; 
          if (button_type == '1') {
            that.setData({
              orderList: daizhifu
            })
          }

        }
        // that.setData({
        //   orderList: (button_type == '0') ? allList : daizhifu
        // })
      }
    }, function () {
      wx.stopPullDownRefresh()
      isRequest = 2
      that.setData({
        isRequest: isRequest,
        orderList: []
      })
      setTimeout(function () {
        wx.showToast({
          title: '请求失败',
          icon: 'none',
          duration: app.showToastDuring
        })
      }, app.delayTime)

    }
    );
  }
});
