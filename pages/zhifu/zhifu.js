Page({
  data:{
    userInfo:''
  },
  onShow(){
    let userInfo=wx.getStorageSync('userInfo')
    console.log(userInfo)
    if(userInfo){
      this.setData({
        userInfo: userInfo
      })
    }
  }
})