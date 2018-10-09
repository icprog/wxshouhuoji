
App({
  onLaunch: function (options) {
    console.log("onLaunch")
    this.getUserInfo()

    let that=this
    wx.login({
      success: function (res) {
        wx.setStorageSync('code', res.code)
        let code = res.code
        //发起网络请求
        wx.request({
          url: that.globalData.servel_url +'getWxPhone',
          method: 'POST',
          data: {code:code},
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          dataType: 'json',
          success: function (res) {
            console.log(res)
            if(res.data.code=='0'){
              wx.setStorageSync('session_key', res.data.msg)
            }else{
              wx.showToast({
                title: res.data.msg,
                duration: that.showToastDuring,
                icon:'none'
              })
            }
          },
          fail: function (res) {
            console.log(res)
            wx.showToast({
              title: '获取session_key失败',
              duration: that.showToastDuring,
              icon: 'none'
            })
          }
        });
      }
    })
  },
  onShow: function(options){
    console.log("onShow")
    console.log(options)
    var timestamp = Date.parse(new Date()) / 1000;
    console.log("当前时间：" + timestamp)
    if (options.query && options.query.q) {
      console.log("当前时间差：" + (timestamp - parseInt(options.query.scancode_time)))
      if (timestamp - parseInt(options.query.scancode_time) < 10) {
        console.log("获取全局二维码");
        this.qrCode = decodeURIComponent(options.query.q);
      }
    }
  },
  userInfo: null,
  aliUserInfo: null,
  qrCode: null,
  dateImage: null,
  dateStr: null,
  storeId: null,
  showToastDuring: 1000,
  delayTime: 700,
  isRefreshOrderList: false,//从订单详情回来是否需要重新刷新订单列表
  phoneNum : '',
  getUserInfo() {
    var that = this 
    try {
      var value = wx.getStorageSync('userInfo')
      that.userInfo = value
    } catch (e) {
    }
  },
  getCurrentTimeType() {
    var date = new Date();
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    var dateStr = this.formatNumber(hour) + ":" + this.formatNumber(minute) + ":" + this.formatNumber(second)
    var type = 0
    if (dateStr >= '06:30:00' && dateStr < '10:00:00') {
      this.dateImage = '../../image/morning.jpg'
      this.dateStr = "美好的一天从早餐开始"
    } else if (dateStr >= '10:00:00' && dateStr < '14:00:00') {
      this.dateImage = '../../image/noon.jpg'
      this.dateStr = "完美午餐,请多加一点"
    } else if (dateStr >= '14:00:00' && dateStr < '17:00:00') {
      this.dateImage = '../../image/afternoon.jpg'
      this.dateStr = "困了吗？叫上好友休闲一下吧!"
    } else {
      this.dateImage = '../../image/night.jpg'
      this.dateStr = "努力了一天,犒劳一下自己吧!"
    }
    console.log(dateStr)
  },

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  globalData: {
    userInfo: null,
    // servel_url :'http://192.168.30.222:8080/machine/',
    servel_url: 'https://machine-pay.27aichi.com/machine/',
    //servel_url:'https://machine.27aichi.com/machine/',
    red_color: "#ff0000",
    green_color: "#009e96",
    // user_url:'http://test1-passport.27aichi.com/passport/',
    //user_url: 'https://passport.27aichi.com/passport/',
    //user_url: 'https://dev1-passport.27aichi.com/passport/',
    //user_url: 'https://dev-gds-crius-user.27aichi.com/passport/',
     user_url: 'https://dev-gds-crius-user.27aichi.com/api/passport/',
    //user_url: 'https://gds-crius-user.27aichi.com/passport/',
  }
  
})