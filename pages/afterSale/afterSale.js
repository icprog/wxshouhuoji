var Request = require('../../Utils/Request.js');
var orderData = {};
var reduceList = [];
var orderNo = '1000000369780347';
var app = getApp();
var isMemberReduce = false
var isRequest = 0
var payButtonCanClick = true
var isPaySuccess = false
var reloadCount = 0
var userInfo = null
var fromType
Page({
  data: {
    cur:0,
    orderData:{},
    isRequest: isRequest,
    noGoodsPromble:false,
    questionArr:[
      {question_title:'商品包装破损'},
      { question_title: '商品保质期问题' },
      { question_title: '多扣费' },
      { question_title: '其他问题' }
    ],
    question_content:'',
    questionCurindex:0,
    showTextarea:false,
    imgList:[],
    userInfo:{},
    goodsList:[],
    goods_no:'',
    goods_name:''
  },
  
  onLoad(query) {
    orderNo = query.orderNo ? query.orderNo :'1000000369780347'
    
    console.log(app)
  },
  onShow() {
    userInfo = app.userInfo
    this.reloadData()
    this.setData({
      userInfo:userInfo
    })
  },
  //选择申请售后商品
  chooseGoods: function(e){
    var noGoodsPromble = this.data.noGoodsPromble;
    var indexId = e.currentTarget.dataset.id
    var goodsList = this.data.goodsList;
    goodsList.map((item,index)=>{
      if(index==indexId){
        item.choose=!item.choose
        if(item.choose){
          noGoodsPromble = false
        }
      }
    })
    this.setData({
      goodsList: goodsList,
      noGoodsPromble: noGoodsPromble
    })
  },
  //选择非商品问题
  chooseNoGoods: function(){
    var noGoodsPromble = this.data.noGoodsPromble;
    noGoodsPromble = !noGoodsPromble;
    var goodsList = this.data.goodsList;
    goodsList.map((item, index) => {
      if (noGoodsPromble){
        item.choose = false
      }
    })
    this.setData({
      noGoodsPromble: noGoodsPromble,
      goodsList: goodsList
    })
  },
  //步骤一 下一步
  oneNext:function(){
    var chooseGoods= false;
    var goodsList = this.data.goodsList;
    goodsList.map((item, index) => {
      if (item.choose ){
        chooseGoods=true;
      } 
    })
    if (!chooseGoods&&!this.data.noGoodsPromble){
      wx.showToast({
        title: '请选择商品或者勾选非商品问题',
        icon: 'none',
        duration: app.showToastDuring
      })
      return;
    }
    var goodsNoArr = []
    var goodsNameArr = []
    var goods_no='';
    var goods_name='';
    goodsList.map((item, index) => {
      if (item.choose) {
        goodsNoArr.push(item.goodsID),
          goodsNameArr.push(item.goodsName)
      }
    })
    if (goodsNoArr.length > 0) {
      goods_no = goodsNoArr.join(",");
      goods_name = goodsNameArr.join(",")
    }
    this.setData({
      cur:1,
      goods_no: goods_no,
      goods_name: goods_name
    })
  },
  //步骤二 上一步
  twoPrev:function(){
    this.setData({
      cur: 0
    })
  },
  //步骤二 下一步
  twoNext: function(){
    var questionCurindex = this.data.questionCurindex
    if (questionCurindex == 3 && this.data.question_content==''){
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none',
        duration: app.showToastDuring
      })
      return;
    }
    this.setData({
      cur: 2
    })
  },
  //选择售后类型
  chooseQuestion:function(e){
    var showTextarea = this.data.showTextarea
    if (e.currentTarget.dataset.id==3){
      showTextarea=true
    }else{
      showTextarea = false
    }

    this.setData({
      questionCurindex: e.currentTarget.dataset.id,
      showTextarea: showTextarea
    })
  },
  //输入其他问题描述
  inputContent:function(e){
      this.setData({
        question_content:e.detail.value
      })
  },
  //获取订单详情数据
  reloadData: function () {
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
      isRequest = 1
      if (res.code == '0') {
        
        orderData = res.data
        orderData.goodsList.map((item)=>{
            item.choose=false
        })

        that.setData({
          orderData: orderData,
          isMemberReduce: isMemberReduce,
          isRequest: isRequest,
          goodsList: orderData.goodsList
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

    });
  },
  joinImg: function (e) {
    var that=this
    if(this.data.imgList&&this.data.imgList.length>=3){
      setTimeout(function () {
        wx.showToast({
          title: '最多只能上传三张图片哦',
          icon: 'none',
          duration: app.showToastDuring
        })
      }, app.delayTime)
      return;
    }
    wx.showActionSheet({
      itemList: ["拍摄", "从手机相册选择"],
      itemColor: "#00",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage("camera");
          } else if (res.tapIndex == 1) {
            that.chooseWxImage("album");
          }
        }
      }
    })
  },
  //选择图片
  chooseWxImage:function(type){
    
    var that=this
    wx.chooseImage({
      count: 3,
      sizeType: ["compressed"],
      sourceType: [type],
      success: function (res) {
        that.uploadImg(res.tempFilePaths)
      },
    })
  },
  //提交售后
  submit:function(){
    var url = app.globalData.servel_url +'machineAfterSale/update'
    var params={}
    params.uid = this.data.userInfo.uid;
    params.randomname = new Date();
    params.randompwd = new Date();
    params.order_no = orderNo;
    params.question_title = this.data.questionArr[this.data.questionCurindex].question_title
    params.question_content = this.data.question_content
    params.goods_names = this.data.goods_name
    params.goods_nos = this.data.goods_no
    
    if(this.data.imgList.length>0){
      var imgList = this.data.imgList
      imgList.map((item,index)=>{
        params['oss_pic_url' + (index+1)]=item
      })
    }
    console.log(params)
    var that=this
    Request.request(url, params, '提交', function (res) {
      isRequest = 1
      if (res.code == '0') {
          wx.navigateTo({
            url: '../appealList/appealList',
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

    });
  },
  //上传图片
  uploadImg: function (tempFilePaths) {
    var uploadImgCount = 0;
    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      mask: true,
      duration: 10000
    })
    var that=this
    for (var i = 0, h = tempFilePaths.length; i < h; i++) {
      wx.uploadFile({
        url: app.globalData.servel_url + 'machineAfterSale/batch/uploadPics',
        filePath: tempFilePaths[i],
        name: 'oss_pic_url',
        formData: null,
        header: {
          "Content-Type": "multipart/form-data"
        },
        success: function (res) {
          uploadImgCount++;
          var imgList = that.data.imgList
          var data = JSON.parse(res.data)
          imgList.push(data.data.oss_pic_url1)
          that.setData({
            imgList: imgList
          });

          //如果是最后一张,则隐藏等待中  
          if (uploadImgCount == tempFilePaths.length) {
            wx.hideToast();
          }
        },
        fail: function (res) {
          wx.hideToast();
          wx.showModal({
            title: '错误提示',
            content: '上传图片失败',
            showCancel: false,
            success: function (res) { }
          })
        }
      });
    }
  },
  //删除图片
  delImg:function(e){
    var index = e.currentTarget.dataset.id
    var imgList = this.data.imgList
    imgList.splice(index, 1) 
    this.setData({
      imgList:imgList
    })
  }
});