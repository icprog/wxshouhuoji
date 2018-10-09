var Request = require('../../Utils/Request.js');
var orderData = {};
var reduceList = [];
var orderNo = '';
var app = getApp();
var isMemberReduce = false
var isRequest = 0
var payButtonCanClick = true
var isPaySuccess = false
var reloadCount = 0
var fromType
Page({
  data: {
    reduceList : [],
    scroll_height: 0,
    status_color: app.globalData.red_color,
    orderData: {},
    isMemberReduce:isMemberReduce,
    isRequest: isRequest
  },
  onUnload() {
    // 页面被关闭
    orderData = {};
    reduceList = [];
    orderNo = '';
    isMemberReduce = false
    isRequest = 0
    isPaySuccess = false
  },
  onLoad(query) {
    var windowH = wx.getSystemInfoSync().windowHeight
    var windowW = wx.getSystemInfoSync().windowWidth
    var height = windowH - 49;
    var image_width = (windowW - 32)/3;
    this.setData({
      reduceList: reduceList,
      scroll_height: height,
      image_width : image_width,
      orderData:orderData
    })
    fromType = query.fromType
    // console.log(JSON.parse(query.orderData))
    if (query.fromType == 'list' || query.fromType == 'unpaid') {
      orderNo = query.orderNo
      this.reloadData()
    }else if(query.fromType == 'opendoor'){
      orderData = JSON.parse(query.orderData)
      orderNo = orderData.orderNo
      reduceList = this.getReduceItems()
      isRequest = 1
      this.setData({
        reduceList: reduceList,
        orderData:orderData,
        isMemberReduce: isMemberReduce,
        isRequest: isRequest
      })
    }
    // orderData = query.orderData
    // orderData.goodsList = orderData.machineIndentCountList
    // console.log(orderData)
    
  },
  reloadData:function(){
    var that = this
    isRequest = 0
    this.setData({
      isRequest: isRequest
    })
    var url = app.globalData.servel_url + 'orderDetail'
    var params = {
      uid: app.userInfo.uid,
      token: app.userInfo.token,
      orderNo: orderNo
    }
    Request.request(url, params, '正在加载', function (res) {
      console.log(res);
      isRequest = 1
      if (res.code == '0') {
        if (isPaySuccess && res.data.orderState != 7){
          wx.showModal({
            title: '提示',
            content: '支付成功,由于网络原因,订单暂时无法刷新',
            confirmText: '刷新订单',
            cancelText: '取消',
            success: (result) => {
              if (result.confirm) {
                that.reloadData()
              }
            },
          });
        }
        orderData = res.data
        reduceList = that.getReduceItems()
        that.setData({
          reduceList: reduceList,
          orderData: orderData,
          isMemberReduce: isMemberReduce,
          isRequest: isRequest
        })
      } else {
        setTimeout(function () {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: app.showToastDuring
          })
        }, app.delayTime)
       
      }   
      }, function () {
        isRequest = 2
        console.log(isRequest);
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
    );
  },
  repurchase:function(){
    wx.navigateBack({
       delta: 5
     })
  },
  getReduceItems:function(){
    var reduse = new Array()
    if (parseFloat(orderData.couponReduce) > 0) {
      var item =
        {
          "type": "减",
          "typeName": "优惠券",
          "reduceCount": "-¥" + orderData.couponReduce
        }
      reduse.push(item)
    }
    if (parseFloat(orderData.memberReduce) > 0) {
      var item =
        {
          "type": "省",
          "typeName": "会员节省",
          "reduceCount": "-¥" + orderData.memberReduce
        }
        isMemberReduce = true
      reduse.push(item)
    }
    if (parseFloat(orderData.integralReduce) > 0) {
      var item =
        {
          "type": "积",
          "typeName": "积分",
          "reduceCount": "-¥" + orderData.integralReduce
        }
      reduse.push(item)
    }
    if (parseFloat(orderData.balanceReduce) > 0) {
      var item =
        {
          "type": "余",
          "typeName": "余额",
          "reduceCount": "-¥" + orderData.balanceReduce
        }
      reduse.push(item)
    }
    console.log(reduse)
    return reduse;
  },
  //申请售后
  goAfterSell:function(){
    console.log(this.data)
    wx.navigateTo({
      url: '../afterSale/afterSale?orderNo=' + this.data.orderData.orderNo
    })
  },
  zhifu:function(e){
    if (orderData.orderState == '7') {
      wx.navigateBack({
        delta: 5
      })
      return
    }
    if(!payButtonCanClick){
      return
    }
    payButtonCanClick = false
    orderNo = orderData.orderNo
    var amount = orderData.payAmount
    var that = this;
    Request.payOrder(orderNo, amount, '会员柜订单:' + orderNo, function (res) {
      payButtonCanClick = true;
      isPaySuccess = true;
      
      that.reloadData()
      if (fromType = 'list') {
        app.isRefreshOrderList = true
      }
    }, function () {
      payButtonCanClick = true;
    })
  },
});
