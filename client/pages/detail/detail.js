var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var constants = require('../../vendor/wafer2-client-sdk/lib/constants');
var SESSION_KEY = 'weapp_session_' + constants.WX_SESSION_MAGIC_ID;
Page({
  // 页面的初始数据
  data: {

    // 活动信息列表
    activityInfo:{},
    num: 0,
    item: '',
    likeInfo:{}
  },

  // “更多”信息跳转
  more:function(e){
    var activityId = this.data.num
    //console.log(activityId)
    wx.navigateTo({
      url: '/pages/more/more?id=' + activityId
    })
  },

  // 关注选择
  switchXin: function (e) {
    //console.log(this.data.item.ifLike)
    var id = this.data.num;
    console.log(id);
    var item = this.data.activityInfo;
    var up = "activityInfo.ifLike"
    var that = this;
    var pacInf = wx.getStorageSync('acInfo');
    if (item.ifLike == true) {
      that.setData({
        [up]: false,
        item: that.data.activityInfo
      })
      for (let i = 0; i < that.data.likeInfo.length; i++) {
        if (that.data.activityInfo.id == that.data.likeInfo[i]) {
          that.data.likeInfo.splice(i, 1);
        }
      }
      
      pacInf[id].ifLike=0;
      wx.setStorage({
        key: 'acInfo',
        data: pacInf
      })
      var sk = wx.getStorageSync(SESSION_KEY);
      wx.request({
        url: `${config.service.host}/weapp/uplike`,
        data: {
          likeId: that.data.likeInfo.join(','),
          skey: sk.skey
        },
        success(res) {
          //util.showSuccess('操作成功！')
        },
        fail(error) {
          util.showModel('请求失败', '网络连接失败')
        }
      })
    } else {
      that.setData({
        [up]: true,
        item: that.data.activityInfo
      })
      that.data.likeInfo.push(that.data.activityInfo.id)
      var sk = wx.getStorageSync(SESSION_KEY);

      wx.request({
        url: `${config.service.host}/weapp/uplike`,
        data: {
          likeId: that.data.likeInfo.join(','),
          skey: sk.skey
        },
        success(res) {
          //util.showSuccess('操作成功！')
        },
        fail(error) {
          util.showModel('请求失败', '网络连接失败')
        }
      })
      pacInf[id].ifLike = 1;
      wx.setStorage({
        key: 'acInfo',
        data: pacInf
      })
    }

  },


  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    //console.log(options.id)
    var that = this;
    var acInf = wx.getStorageSync('acInfo');
    wx.request({
      url: `${config.service.host}/weapp/detail`,
      //login: false,
      data:{
        aid:acInf[options.id].id,
      },
      success(result) {
        //util.showSuccess('请求成功完成')
       // console.log(result.data);
       
        console.log("detail");
        that.data.activityInfo=acInf[options.id];
        console.log(that.data.activityInfo);
        that.data.activityInfo['host']=result.data['host'];
        that.data.activityInfo['detail']=result.data['detail'];
        that.data.activityInfo['remarkDetail'] = result.data['remarkDetail'];
        that.setData({
          activityInfo: that.data.activityInfo
        })
        that.setData({
          num: num1,
          item: that.data.activityInfo,
          likeInfo: wx.getStorageSync('likeInfo')
        })
    
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })

    var num1 = options.id
    //var num1 = 0
    
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: "分享活动：" + this.data.item.name
    }
  }
})