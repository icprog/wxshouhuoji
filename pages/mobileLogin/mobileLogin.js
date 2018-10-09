var check = require("../../Utils/check.js");
var Base64 = require('../../Libs/base64.js');
var Request = require('../../Utils/Request.js');
var WXBizDataCrypt = require('../../Libs/RdWXBizDataCrypt.js');
var app = getApp()
// var step = 1 // 当前操作的step  
var maxTime = 60
var currentTime = maxTime //倒计时的事件（单位：s）  

var phoneNum = ''
var vertify_code = ''
var isCanClick = true
var interval
Page({
  data: {
    message: '获取验证码',
    canClick:true
  },
  onLoad() {
  },
  onShow(){
    phoneNum = app.phoneNum;
    this.setData({
      phoneNum: phoneNum
    })

    let timer = setInterval(() => {
      let wx_userInfo = wx.getStorageSync('wx_userInfo')
      if (!wx_userInfo){
        wx.getUserInfo({
          success: res => {
            console.log(res)

            let session_key = wx.getStorageSync('session_key')
            var pc = new WXBizDataCrypt('wx3a526c56186609f5', session_key)
            var data = pc.decryptData(res.encryptedData, res.iv)
            console.log('解密后 data: ', data)

            wx.setStorageSync('openid', data.openId)            

            wx.setStorageSync('wx_userInfo', res.userInfo)
            clearInterval(timer)
          }
        })
      }
    }, 500)
    
  },
  //点击登录
  listenerLogin: function () {
    // this.testLogin()
    if (!this.isMobileNumber(phoneNum)) {
      return;
    }
    if (vertify_code == '' || vertify_code == null) {
      wx.showToast({
        title: "验证码不能为空",
        icon: 'none',
        duration: app.showToastDuring
      });
      return;
    }
    var that = this

    //var url = app.globalData.user_url + 'user/login'
    var url = app.globalData.user_url + 'vending/register'
    var object = {
      mobile: phoneNum,
      smsCode: vertify_code,
      //loginType: 2,
      //client: 1
      client: 5
    }
    JSON.stringify(object);
    var params = {
      data: Base64.base64_encode(JSON.stringify(object))
    };
    Request.request(url, params, '正在登录', function (res) {
      console.log(res);
      if (res.code == '0') {
        console.log('登录成功');
        clearInterval(interval)
        currentTime = maxTime
        isCanClick = true
        that.setData({
          message: '重新获取'
        })
        //登录成功存入本地
        var userInfo = res.data
        try {
          wx.setStorageSync('userInfo', userInfo)
        } catch (e) {
        }
        app.getUserInfo()
        wx.navigateBack({
          delta: 5
        })
      } else {
        setTimeout(function () {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: app.showToastDuring
          });
        }, app.delayTime)
        
      }
    }, function () {
      setTimeout(function () {
        wx.showToast({
          title: '登录失败',
          icon: 'none',
          duration: app.showToastDuring
        })
      }, app.delayTime)
     
    }
    );
  },
  gotoRegister: function (e) {
    wx.navigateTo({
      url: '../mobileRegister/mobileRegister',
    })
  },
  gotoPasswordLogin: function () {
    wx.navigateTo({
      url: '../passwordLogin/passwordLogin',
    })
   
  },
  //获取验证码
  get_vertify_code: function () {
    //   this.change_get_code_button(this);
    if (!isCanClick) {
      return;
    }
    if (!this.isMobileNumber(phoneNum)) {
      return;
    }
    isCanClick = false;
    var that = this
    var url = app.globalData.user_url + 'sms/getsms'
    var object = {
      mobile: phoneNum,
      sendType: 1,
      isCheckMobile: 0,
      purposeType: 5
    }
    console.log(url);
    console.log(Base64.base64_encode(JSON.stringify(object)));
    JSON.stringify(Base64.base64_encode(JSON.stringify(object)));
    var params = {
      data: Base64.base64_encode(JSON.stringify(object))
    };
    Request.request(url, params, '正在获取验证码', function (res) {
      console.log(res);
      if (res.code == '0') {
        console.log('获取验证码成功');
        that.change_get_code_button(that);
      } else {
        setTimeout(function () {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: app.showToastDuring
          });
        }, app.delayTime)
        isCanClick = true
      }
    }
    );
  },
  //输入框输入监听
  input_phoneNum: function (e) {
    console.log(e.detail.value)
    phoneNum = e.detail.value
    app.phoneNum = e.detail.value
  },
  input_code: function (e) {
    console.log(e.detail.value)
    vertify_code = e.detail.value
  },


  //改变获取验证码button
  change_get_code_button: function (that) {
    isCanClick = false
    that.setData({
      message: (currentTime) + '重新获取'
    })
    interval = setInterval(function () {
      currentTime--
      that.setData({
        message: (currentTime) + '重新获取'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        currentTime = maxTime
        isCanClick = true
        that.setData({
          message: '重新获取'
        })
      }
    }, 1000)
  },
  //检查手机号是否合法
  isMobileNumber: function (phone) {
    var flag = false;
    var message = "";
    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(17[0-9]{1})|(15[0-3]{1})|(15[4-9]{1})|(18[0-9]{1})|(199))+\d{8})$/;
    if (phone == '') {
      // console.log("手机号码不能为空");  
      message = "手机号码不能为空！";
    } else if (phone.length != 11) {
      //console.log("请输入11位手机号码！");  
      message = "请输入11位手机号码！";
    } else if (!myreg.test(phone)) {
      //console.log("请输入有效的手机号码！");  
      message = "请输入有效的手机号码！";
    } else {
      flag = true;
    }
    if (message != "") {
      // alert(message);  
      console.log(message);
      wx.showToast({
        icon: 'none',
        title: message,
        duration: app.showToastDuring
      });
    }
    return flag;
  },



  testLogin: function () {
    console.log('直接登录')
    var that = this
    var url = app.globalData.user_url + 'user/login'
    var object = {
      mobile: '15333160374',
      password: 'woshini88',
      loginType: 1,
      client: 1
    }
    var params = {
      data: Base64.base64_encode(JSON.stringify(object))
    };
    Request.request(url, params, '注册成功，正在登录', function (res) {
      console.log(res);
      if (res.code == '0') {
        console.log('登录成功');

        //登录成功存入本地
        var userInfo = res.data
        my.setStorageSync({
          key: 'userInfo',
          data: userInfo,
        });
        app.getUserInfo()
        my.navigateBack({
          delta: 2
        })
      } else {
        my.showToast({
          content: res.message,
          duration: 1500,
        });
        my.navigateBack({
          delta: 1
        })
      }
    }, function () {
      my.showToast({
        content: '登录失败',
      })
      my.navigateBack({
        delta: 1
      })
    }
    );
  },
  onUnload() {
    // 页面被关闭
    clearInterval(interval)
    currentTime = maxTime
    isCanClick = true
    currentTime = maxTime //倒计时的事件（单位：s）  
    phoneNum = ''
    vertify_code = ''
    isCanClick = true
  },

  getPhoneNumber(e){
    console.log(e)
    this.setData({
      canClick: false
    })
    wx.showLoading({
      title: '授权中，请稍后',
      mask:true
    })
    if (e.detail.encryptedData){
      this.decodePhone(e.detail.encryptedData, e.detail.iv)
    }else{
      wx.hideLoading()
      this.setData({
        canClick: true
      })
      setTimeout(()=>{
        wx.showToast({
          title: '授权失败，请重新授权',
          icon: 'none',
          mask: true,
          duration: app.showToastDuring
        });
      },500)
    }
    
  },

  decodePhone(encryptedData,iv){
    let session_key= wx.getStorageSync('session_key')
    let that=this
    wx.checkSession({
      success: function () {
        //session_key 未过期，并且在本生命周期一直有效
        var pc = new WXBizDataCrypt('wx3a526c56186609f5', session_key)
        var data = pc.decryptData(encryptedData, iv)
        console.log('解密后 data: ', data.phoneNumber)
        wx.setStorageSync('wx_phone', +data.phoneNumber)
        that.loginAction(data.phoneNumber)
      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        //wx.login() //重新登录
        wx.hideLoading()
        setTimeout(() => {
          wx.showToast({
            title: '授权失败，请重新授权',
            icon: 'none',
            mask: true,
            duration: app.showToastDuring
          });
        }, 500)
        that.setData({
          canClick: true
        })
      }
    })
  },

  loginAction(phone){
    let that=this,userInfo=wx.getStorageSync('wx_userInfo')
    let data={
      mobile: phone,
      client:5,
      nickname: userInfo.nickName,
      sex: userInfo.gender,
      headimg: userInfo.avatarUrl,
      loginType: 3// 1、账号密码登陆2、手机验证码登陆3、自动登录
    }
    console.log(data)
    var a = Base64.base64_encode(JSON.stringify(data))
    var params = {
      data: Base64.base64_encode(JSON.stringify(data)),
      nickname: userInfo.nickName,
    };
    console.log(Base64.base64_decode(a))
    wx.request({
      url: app.globalData.user_url + 'vendingRegister',
      method: 'POST',
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      success: function (res) {
        console.log(res)
        if (res.data.code == '0') {
          wx.showToast({
            title: '授权成功',
            icon: 'none',
            mask: true,
            duration: app.showToastDuring
          });
          
          //登录成功存入本地
          var userInfo = res.data.data
          console.log(userInfo)
          try {
            wx.setStorageSync('userInfo', res.data.data)
          } catch (e) {

          }
          app.getUserInfo()
          setTimeout(()=>{
            that.setData({
              canClick: true
            })
            wx.hideLoading()
            wx.navigateBack({
              delta: 5
            })
          },1000)
        } else {
          wx.showToast({
            title: '授权失败，请重新授权',
            icon: 'none',
            mask: true,
            duration: app.showToastDuring
          });
          wx.hideLoading()
          that.setData({
            canClick: true
          })
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '授权失败，请重新授权',
          duration:app.showToastDuring,
          icon:'none',
          mask: true
        })
        wx.hideLoading()
        that.setData({
          canClick: true
        })
      }
    });
  }
});
