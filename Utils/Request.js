var app = getApp()
function request(url, params, message, success, fail) {
  console.log(params)
  if (message != '') {
    wx.showLoading({
      title: message,
    });
  }
  wx.request({
    url: url,
    method: 'POST',
    data: params,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    dataType: 'json',
    success: function (res) {
       console.log(res)
      if (message != '') {
        wx.hideLoading();
      }
      if(res.statusCode && res.statusCode == 200){
        success(res.data)
      }else{
        fail()
      }
    },
    fail: function (res) {
      console.log(res)
      if (message != '') {
        wx.hideLoading();
      }
      fail()
    },
    complete: function (res) {
      if (message != '') {
        wx.hideLoading();
      }
    }
  });
}
function payDeposit(success, fail) {//交纳押金
  var that = this
  if (app.userInfo&&app.userInfo.uid){
    wx.login({
      success: function (res) {
        console.log(res)
        if (res.code) {
          //发起网络请求
          // var url = 'http://192.168.17.76:8080/machine/' + 'wx_pay_pledge'
          var url = app.globalData.servel_url + 'wx_pay_pledge'
          console.log(url)
          var params = {
            uid: app.userInfo.uid,
            body: '押金99',
            payAmount: 9900,
            type: 'MINI',
            code: res.code
          }
          that.request(url, params, '加载中', function (res) {
            console.log("success", res);
            if (res.code == '0') {
              wx.requestPayment(
                {
                  'timeStamp': res.data.timeStamp,
                  'nonceStr': res.data.nonceStr,
                  'package': res.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.sign,
                  'success': function (res) {
                    console.log("success:", res)
                    success(res)
                  },
                  'fail': function (res) {
                    console.log("fail:", res)
                    fail()
                  },
                  'complete': function (res) { }
                })
            } else {
              // wx.showToast({
              //   title: res.msg,
              //   duration: app.showToastDuring,
              //   icon: 'none'
              // })
              fail()
            }

          },
            function () {
              // wx.showToast({
              //   title: '获取押金信息失败',
              //   duration: app.showToastDuring,
              //   icon: 'none'
              // })
              fail()
            })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  }else{
    wx.navigateTo({
      url: '../mobileLogin/mobileLogin',
    })
  }
  
  // var url = app.globalData.servel_url + 'wx_pay_pledge'
}
function queryDeposit(success, fail) {
  // var url = 'http://192.168.17.63/machine/' + 'query_pledge'
  var url = app.globalData.servel_url + 'query_pledge'
  var params = {
    uid: app.userInfo.uid
  }
  this.request(url, params, '', function (res) {
    console.log(res)
    success(res)
  },
    function () {
      setTimeout(function () {
        wx.showToast({
          title: "请求失败",
          duration: app.showToastDuring,
          icon: 'none'
        })
      }, app.delayTime)
      
      fail()
    }
  )
}
function closeDeposit(success, fail) {
  // var url = 'http://wanghaoran.iok.la:47493/machine/' + 'wx_refund_pledge'
  if (app.userInfo&&app.userInfo.uid){
    var url = app.globalData.servel_url + 'wx_refund_pledge'
    var params = {
      uid: app.userInfo.uid
    }
    this.request(url, params, '正在退押金', function (res) {
      console.log(res)
      if (res.code == '0') {
        setTimeout(function () {
          wx.showToast({
            title: '押金已退还',
            duration: app.showToastDuring,
            icon: 'none'
          })
        }, app.delayTime)

        success(res)
      } else {
        setTimeout(function () {
          wx.showToast({
            title: res.msg,
            duration: app.showToastDuring,
            icon: 'none'
          })
        }, app.delayTime)

      }
    },
      function () {
        setTimeout(function () {
          wx.showToast({
            title: "请求失败",
            duration: app.showToastDuring,
            icon: 'none'
          })
        }, app.delayTime)

        fail()
      }
    )
  }else{
    wx.navigateTo({
      url: '../mobileLogin/mobileLogin',
    })
  }
}
function payOrder(orderNo, payAmount, des, success, fail) {
  var that = this
  wx.login({
    success: function (res) {
      console.log(res)
      if (res.code) {
        var url = app.globalData.servel_url + 'wx_pay'
        // var url = 'http://192.168.17.76:8080/machine/' + 'wx_pay'
        var amount = parseInt(parseFloat(payAmount) * 100)

        console.log(url, amount)
        var params = {
          orderNo: orderNo,
          body: des,
          payAmount: amount,
          type: 'MINI',
          code: res.code
        }
        that.request(url, params, '获取支付信息', function (res) {
          console.log(res);
          wx.requestPayment(
            {
              'timeStamp': res.data.timeStamp,
              'nonceStr': res.data.nonceStr,
              'package': res.data.package,
              'signType': 'MD5',
              'paySign': res.data.sign,
              'success': function (res) {
                console.log('success:', res)
                success(res)
                setTimeout(function () {
                  wx.showToast({
                    title: '支付成功',
                    duration: app.showToastDuring,
                    icon: 'none'
                  })
                }, app.delayTime)
                
              },
              'fail': function (res) {
                console.log('fail:', res)
                fail()
              },
              'complete': function (res) { }
            })
        }, function () {
          setTimeout(function () {
            wx.showToast({
              title: '获取支付信息失败',
              duration: app.showToastDuring,
              icon: 'none'
            })
          }, app.delayTime)
          
          fail()
        })
      } else {
        console.log('登录失败！' + res.errMsg)
      }
    }
  })

}

function payMember(success, fail) {//交纳押金
  var that = this
  if (app.userInfo && app.userInfo.uid) {
    wx.login({
      success: function (res) {
        console.log(res)
        if (res.code) {
          //发起网络请求
          // var url = 'http://192.168.17.76:8080/machine/' + 'wx_pay_member'
          var url = app.globalData.servel_url + 'wx_pay_member'
          console.log(url)
          var params = {
            uid: app.userInfo.uid,
            body: '会员费',
            type: 'MINI',
            code: res.code
          }
          that.request(url, params, '加载中', function (res) {
            console.log("success", res);
            if (res.code == '0') {
              wx.requestPayment(
                {
                  'timeStamp': res.data.timeStamp,
                  'nonceStr': res.data.nonceStr,
                  'package': res.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.sign,
                  'success': function (res) {
                    console.log("success:", res)
                    success(res)
                  },
                  'fail': function (res) {
                    console.log("fail:", res)
                    fail()
                  },
                  'complete': function (res) { }
                })
            } else {
              // wx.showToast({
              //   title: res.msg,
              //   duration: app.showToastDuring,
              //   icon: 'none'
              // })
              fail()
            }

          },
            function () {
              // wx.showToast({
              //   title: '获取押金信息失败',
              //   duration: app.showToastDuring,
              //   icon: 'none'
              // })
              fail()
            })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  } else {
    wx.navigateTo({
      url: '../mobileLogin/mobileLogin',
    })
  }

  // var url = app.globalData.servel_url + 'wx_pay_pledge'
}

function queryIsMember(success, fail) {
    // var url = 'http://192.168.17.63/machine/' + 'query_pledge'
    var url = app.globalData.servel_url + 'isMember'
    var params = {
        uid: app.userInfo.uid,
        token:app.userInfo.token,
        qrCode:app.qrCode,
    }
    this.request(url, params, '', function (res) {
            console.log(res)
            success(res)
        },
        function () {
            setTimeout(function () {
                wx.showToast({
                    title: "请求失败",
                    duration: app.showToastDuring,
                    icon: 'none'
                })
            }, app.delayTime)

            fail()
        }
    )
}

module.exports.request = request;
module.exports.payDeposit = payDeposit;
module.exports.payOrder = payOrder;
module.exports.closeDeposit = closeDeposit;
module.exports.queryDeposit = queryDeposit;
module.exports.payMember = payMember;
module.exports.queryIsMember = queryIsMember;



