var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    showTopTips: false,

    radioItems: [
      { name: 'cell standard', value: '0' },
      { name: 'cell standard', value: '1', checked: true }
    ],
    checkboxItems: [
      { name: 'standard is dealt for u.', value: '0', checked: true },
      { name: 'standard is dealicient for u.', value: '1' }
    ],

    date: "2018-06-10",
    time: "19:00",

    // 变量名
    name: '',
    data: '',
    acTime: '',
    location: '',
    host: '',
    attention: '',
    intro: ''
  },

  nameInput: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value,
      acTime: e.detail.value
    })
  },

  locationInput: function (e) {
    this.setData({
      location: e.detail.value
    })
  },

  hostInput: function (e) {
    this.setData({
      host: e.detail.value
    })
  },
  
  attentionInput: function (e) {
    this.setData({
      attention: e.detail.value
    })
  },

  introInput: function (e) {
    this.setData({
      intro: e.detail.value
    })
  },

  showTopTips: function (e) {
   // console.log(wx.getStorageSync('acInfo').length);
   var that = this
    wx.request({
      url: `${config.service.host}/weapp/submit`,


      data: {
        aid: wx.getStorageSync('acInfo').length+1,
        name: that.data.name,
        time: that.data.date + ' ' + that.data.time,
        location: that.data.location,
        host: that.data.host,
        remark: that.data.attention,
        detail: that.data.intro

      },
      success(result) {
        //util.showSuccess('请求成功完成')
        wx.request({
          url: `${config.service.host}/weapp/submit`,


          data: {
            aid: wx.getStorageSync('acInfo').length + 1,
            name: that.data.name,
            time: that.data.date + ' ' + that.data.time,
            location: that.data.location,
            host: that.data.host,
            remark: that.data.attention,
            detail: that.data.intro

          },
          success(result) {
            that.setData({
              likeResult: result.data,

            })
            wx.setStorageSync('likeInfo', that.data.likeResult)
            wx.switchTab({
              url: '/pages/home/home'
            })
          },
          fail(error) {
            util.showModel('请求失败', error);
            console.log('request fail', error);
          },
        })
      }
    })
  }
})