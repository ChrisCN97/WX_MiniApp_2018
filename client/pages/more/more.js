var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({

  // 页面的初始数据
  data: {
    // 活动信息列表
    
    num: 0,
    context: ""
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var acInf = wx.getStorageSync('acInfo');
    this.data.num=options.id;
    var that = this;
    wx.request({
      url: `${config.service.host}/weapp/more`,
      //login: false,
      data:{
        aid:acInf[options.id].id,
      },
      success(result) {
        //util.showSuccess('请求成功完成');
       // console.log(result.data);
       
       
       that.setData({
         context:result.data.detail,

       });
       
        
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
    //console.log(num1)
    //var num1 = 0
    
  }
})