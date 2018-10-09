var Request = require('../../Utils/Request.js');
var app = getApp()
var machineID
var userInfo=null
var qrCode = null
var isPermission = 0
var isRequestSuccess = false
var isMember = false
var isCheckingUser = false
var pledgeIsVip = 0;
var WXBizDataCrypt = require('../../Libs/RdWXBizDataCrypt.js');
var interval;
var maxTime = 30
var currentTime = maxTime //倒计时的事件（单位：s）
Page({
  data: {
    checkedValue: false, //是否同意用户协议
    showLimit: false,  //是否显示限制用户页
    userInfo:userInfo,
    qrCode:qrCode,
    isPermission:isPermission,
    isMember:isMember,
    customerServicePhone: '', //客服电话
    orderNo: '',
    items: [
      {
        title: '交纳押金',
        des: '无人货柜是先拿商品后付费，不开通免密支付的话，您可以选择缴纳99元押金购物。交纳押金可以享受悦盒会员价，超级实惠。押金随时可退，安全可靠。',
        buttonTitle: '交纳押金',
        type: '1',
        img: "../../image/bg_deposit.png"
      },
      {
        title: '成为路上会员',
        des: '缴纳100元年费可成为路上平台会员。享受上述多种超级福利。会员年费不可退，不可用于消费。',
        buttonTitle: '成为会员，立享会员价',
        type: '2',
        img: "../../image/bg_member.png"
      },
    ],
    canClick:true
  },
  onShow() {
    // 页面显示
    if(!isCheckingUser){
      this.reloadData()
    }
    
    
  },
  jump(){
    wx.navigateTo({
      url: '../zhifu/zhifu',
    })
  },
  onLoad(query) {
    app.getCurrentTimeType()
    this.setData({
      backgroundImage:app.dateImage,
      dateStr:app.dateStr
    })
},
  memberOrDeposi:function(e){
      var type = e.currentTarget.dataset.type;
      console.log(type)
      var that = this

      if(type == '1'){

        Request.payDeposit(function (res) {
          that.reloadData()
        }, function () {

        })
      }else if(type == '2'){
      if (!this.data.checkedValue) {

        wx.showToast({
          title: '请先同意协议',
          image: '../../image/warning.png',
          duration: 1000
        }) 
        return
      }
        Request.payMember(function (res) {

            interval = setInterval(function () {
                currentTime--

                Request.queryIsMember(function (res) {
                    // that.reloadData()
                    
                    if (res.msg == 1) {
                      that.setData({
                          isPermission:1
                      })

                        clearInterval(interval)
                    }
                }, function () {

                })

                if (currentTime <= 0) {
                    clearInterval(interval)

                }
            }, 2000)

          that.reloadData()
        }, function () {

        })
      }
  },
  myClick:function(){
    console.log('点击了....')
    
    if(!userInfo){
      wx.getUserInfo({
        success: res => {
          console.log(res)

          let session_key = wx.getStorageSync('session_key')
          var pc = new WXBizDataCrypt('wx3a526c56186609f5', session_key)
          var data = pc.decryptData(res.encryptedData, res.iv)
          console.log('解密后 data: ', data)

          wx.setStorageSync('openid', data.openId) 

          wx.setStorageSync('wx_userInfo', res.userInfo)
        }
      })
      wx.navigateTo({
        url: '../mobileLogin/mobileLogin',
    })
    }
    else{
      wx.navigateTo({
        url: '../my/my',
      })
    }
  },
  orderListClick:function(){
    console.log('点击了....')
    
    if(!userInfo){
      wx.getUserInfo({
        success: res => {
          console.log(res)

          let session_key = wx.getStorageSync('session_key')
          var pc = new WXBizDataCrypt('wx3a526c56186609f5', session_key)
          var data = pc.decryptData(res.encryptedData, res.iv)
          console.log('解密后 data: ', data)

          wx.setStorageSync('openid', data.openId) 

          wx.setStorageSync('wx_userInfo', res.userInfo)
        }
      })
      wx.navigateTo({
        url: '../mobileLogin/mobileLogin',
    })
    }
    else{
      wx.navigateTo({
      url: '../orderList/orderList',
    })
    }
  },
  //拨打客服电话
  callPhone:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.customerServicePhone 
    })
  },
  //轮询开门状态
  openDoorFind: function (open_type, isMember){
    var url = app.globalData.servel_url + 'openDoorFind'
    var params={}
    params.orderNo = this.data.orderNo;
    params.mode=1;
    params.randomname= new Date();
    params.randompwd= new Date();
    params.machineNo=machineID;
    var that= this
    
    Request.request(url, params, '', function (res) {
      
      if (res.code == '0') {
        if (res.msg==0){
          setTimeout(function () {
            //要延时执行的代码  
            that.openDoorFind(open_type, isMember)
          }, 1000)
        } else if (res.msg == 1){
          that.setData({
            canClick: true
          })
          wx.navigateTo({
            url: '../have-opened/have-opened?orderNo=' + that.data.orderNo + '&open_type=' + open_type + '&isMember=' + isMember,
          })
        } else if (res.msg == 2){
          that.setData({
            canClick: true
          })
          setTimeout(function () {
            wx.showToast({
              title: '开门失败，请重新点击开门',
              icon: 'none',
              duration: app.showToastDuring
            })
          }, app.delayTime)
        }
      }else{
        setTimeout(function () {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: app.showToastDuring
          })
        }, app.delayTime)
      }
    }, function () {
      that.setData({
        canClick: true
      })
      setTimeout(function () {
        wx.showToast({
          title: '请求服务器失败,请稍后重试',
          duration: app.showToastDuring,
          icon: 'none'
        })
      }, app.delayTime)

    })
  },
  opendoor:function(e){
    //1、没登录，去登录
    if(!userInfo && app.qrCode){
      wx.navigateTo({
        url: '../mobileLogin/mobileLogin',
      })
      return;
    }
    //2、已登录：没扫码，先扫码
    if(!qrCode){
      var that = this
      wx.scanCode({
        success: (res) => {
          console.log(res)
          app.qrCode = res.result
          if(!isCheckingUser){
            that.reloadData();
           
          }
          
        }
      })
      return;
    }
    //3、点击开门：
    var open_type = e.currentTarget.dataset.type;
    console.log("开门类型" + open_type + "机器ID：" +machineID)
    var url = app.globalData.servel_url + 'opendoor'
    var that = this 
    var params = {
      uid: userInfo.uid,
      token: userInfo.token,
      machineID: machineID,
      type: open_type,
      orderSource: '0',
      openid:wx.getStorageSync('openid')
    }
    this.setData({
      canClick:false
    })

    Request.request(url, params,'正在开门',function (res) {
      app.qrCode = null
      qrCode = null
      /*that.setData({
        qrCode: qrCode,
      })
      that.reloadData()*/
      console.log(res)
      that.setData({
        canClick:true
      })
      if (res.code == '0') {
        that.setData({
          canClick: false
        })
        that.setData({
          orderNo: res.data.orderNo
        })
        that.openDoorFind(open_type, isMember)
      
      } else {
        console.log('提示时间:', app.showToastDuring)
        setTimeout(function () {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: app.showToastDuring
          })
        }, app.delayTime)
        
      }
    }, function () {
      that.setData({
        canClick: true
      })
      setTimeout(function () {
        wx.showToast({
          title: '请求服务器失败,请稍后重试',
          duration: app.showToastDuring,
          icon: 'none'
        })
      }, app.delayTime)
      
    });
  },
  getStoreId:function(){
    my.showLoading({
     content: '加载中...',
     });
    var url = app.globalData.servel_url + 'qrCode'
    var that = this;
    my.httpRequest({
     url: url,
     method: 'POST',
     data: {
       qrCode: qrCode
     },
     
    dataType: 'json',
    success: function(res) {
      my.hideLoading();
      console.log(res.data)
      if(res.data.code != '0'){
            my.showToast({
              content: res.data.msg,
            })
           app.qrCode = null
           qrCode = app.qrCode
           that.setData({
           qrCode:qrCode,
           })
           return
      }
      if (!userInfo) {
          console.log('storeId：'+res.data.data.storeId)
          app.storeId = res.data.data.storeId
          // my.navigateTo({
          //   url: '../mobileLogin/mobileLogin',
          // })
      }
    },
    fail: function(res) {
      my.hideLoading();
      // my.alert({content: 'fail'});
    },
    complete: function(res) {
    my.hideLoading();
    }
   });
  },
  reloadData:function(){
    userInfo = app.userInfo
    qrCode = app.qrCode
    isRequestSuccess = false
    this.setData({
      userInfo:userInfo,
      qrCode:qrCode,
      isRequestSuccess:isRequestSuccess
    })
    console.log(userInfo)
    console.log(qrCode)
    if (!userInfo&&qrCode) {
      // this.getStoreId()
      return;
    }
    if(userInfo && qrCode){
      var url = app.globalData.servel_url + 'qrCode'
      var that = this;
      var params = {
        uid: userInfo.uid,
        token: userInfo.token,
        qrCode: qrCode
      }
      console.log(params);
      isCheckingUser = true
      Request.request(url, params, '加载中', function (res) {
        console.log(res)
        isCheckingUser = false
        if (res.code != '0') {
          setTimeout(function () {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: app.showToastDuring
            })
          }, app.delayTime)
          
          // isRequestSuccess = true
          app.qrCode = null
          qrCode = app.qrCode
          that.setData({
            qrCode: qrCode,
            // isRequestSuccess: isRequestSuccess
          })
          return
        }

        if (res.data.ifUnpaidOrder == '1') {
          app.qrCode = null
          qrCode = app.qrCode
          that.setData({
            qrCode: qrCode,
          })
          wx.showModal({
            title: '温馨提示',
            content: '抱歉,您上次购物还未完成支付,请先完成支付再购物,金额:¥' + res.data.unpaidOrderAmount,
            confirmText: '立即支付',
            cancelText: '查看订单',
            success: (result) => {
              if (result.confirm) {
                that.zhifu(res.data)
              } else {
                wx.navigateTo({
                  url: '../orderDetail/orderDetail?orderNo=' + res.data.unpaidOrderNo + '&fromType=unpaid',
                })
              }
            },
          });
          return;
        }
        if (res.data.fault&&res.data.fault.length > 0) {
          var faultLevel = 3
          for (var i = 0; i < res.data.fault.length;i ++){
            var fault = res.data.fault[i]
            if (parseInt(fault.faultLevel) < faultLevel){
              faultLevel = parseInt(fault.faultLevel)
            }
          }
          if(faultLevel == 1 || faultLevel == 2){
            app.qrCode = null
            qrCode = app.qrCode
            that.setData({
              qrCode: qrCode,
            })
            wx.showModal({
              title: '温馨提示',
              content: '当前售卖机处于故障状态,无法购物,抱歉给您造成了困扰',
              confirmText: '确定',
              showCancel:false,
              success: (result) => {

              },
            });
            return;
          }
        }
        if (res.data.role == '100') {
          app.qrCode = null
          qrCode = app.qrCode
          var phone = res.data.customerServicePhone
          var reg = /^(\d{3})(\d{4})(\d{4})$/;
          var matches = reg.exec(phone);
          that.setData({
            qrCode: qrCode,
            showLimit: true,
            customerServicePhone: matches[1] + ' ' + matches[2] + ' ' + matches[3],
          })
          // wx.showModal({
          //   title: '温馨提示',
          //   content: '抱歉,系统检测到您被设置为“限制用户”,无法购物,如有异议请联系客服',
          //   confirmText: '联系客服',
          //   cancelText: '取消',
          //   success: (result) => {
          //     if (result.confirm) {
          //       wx.makePhoneCall({
          //         phoneNumber: res.data.customerServicePhone //仅为示例，并非真实的电话号码
          //       })
          //     }
          //   },
          // });
          return;
        }
        // if(true){
        //   wx.showModal({
        //     title: '温馨提示',
        //     content: '抱歉,微信暂不支持购买，请到支付宝购物',
        //     showCancel:false,
        //   });
        //   return;
        // }
       

        isRequestSuccess = true
        machineID = res.data.machineID
        isMember = res.data.ifMember == '1'
        if (res.data.ifMember == '1' && res.data.ifDeposi != '1') {
          isPermission = 1;//会员非免密    
        } else if (res.data.ifMember != '1' && res.data.ifDeposi == '1') {
          isPermission = 2;//免密非会员 
        } else if (res.data.ifMember == '1' && res.data.ifDeposi == '1') {
          isPermission = 3;//会员+免密   
        } else {
          isPermission = 0;
        }
        that.setData({
          //  isPermission:false,
          isRequestSuccess: isRequestSuccess,
          isMember: isMember,
          isPermission: isPermission,
          pledgeIsVip:res.data.pledge_is_vip,
        })

        let newPledgeIsVip = that.data.pledgeIsVip;
        if (newPledgeIsVip == 0) {

          let newitems = [
            {
              title: '成为路上会员',
              des: '缴纳100元年费可成为路上平台会员。享受上述多种超级福利。会员年费不可退，不可用于消费。',
              buttonTitle: '成为会员，立享会员价',
              type: '2',
              img: "../../image/bg_member.png"
            },
          ]

          that.setData({

            items: newitems
          })
        } else if (newPledgeIsVip == 1){
          
          let newitems = [
            {
              title: '交纳押金',
              des: '无人货柜是先拿商品后付费，不开通免密支付的话，您可以选择缴纳99元押金购物。交纳押金可以享受悦盒会员价，超级实惠。押金随时可退，安全可靠。',
              buttonTitle: '交纳押金',
              type: '1',
              img: "../../image/bg_deposit.png"
            },
            {
              title: '成为路上会员',
              des: '缴纳100元年费可成为路上平台会员。享受上述多种超级福利。会员年费不可退，不可用于消费。',
              buttonTitle: '成为会员，立享会员价',
              type: '2',
              img: "../../image/bg_member.png"
            },
          ]

          that.setData({

            items: newitems
          })
        }
      }, function () {
        isCheckingUser = false
        setTimeout(function () {
          wx.showToast({
            title: '请求服务器失败,请稍后重试',
            icon: 'none',
            duration: app.showToastDuring
          })
        }, app.delayTime)
       
        // isRequestSuccess = true
        app.qrCode = null
        qrCode = app.qrCode
        that.setData({
          qrCode: qrCode,
          isRequestSuccess: isRequestSuccess
        })
      }
      );
    }
  },
  zhifu:function(orderInfo){
    var orderNo = orderInfo.unpaidOrderNo
    var amount = orderInfo.unpaidOrderAmount
    var that = this;
    Request.payOrder(orderNo,amount,'会员柜订单:'+orderNo,function(res){
      that.reloadData()
    },function(){
    })
  },
  // 是否同意会员协议
  checkboxChange: function() {
    let checkedValue = this.data.checkedValue;
    this.setData({
      checkedValue: !checkedValue
    })
  },
  // 点击同意会员协议文字跳转到协议页面
  toAgreement: function() {
    wx.navigateTo({
      url: "../agreement/agreement"
    })
  }
});
