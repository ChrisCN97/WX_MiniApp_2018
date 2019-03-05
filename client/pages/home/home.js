var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var constants = require('../../vendor/wafer2-client-sdk/lib/constants');
var SESSION_KEY = 'weapp_session_' + constants.WX_SESSION_MAGIC_ID;


Page({
  // 页面的初始数据
  data: {
    // banner栏
    requestResult:'',
    banner: [
      {
        url: 'banner/2.jpg',
        id: 1,
        web: '2'
      },
      {
        url: 'banner/1.jpg',
        id: 0,
        web: '1'
      },
      {
        url: 'banner/3.jpg',
        id: 2,
        web: '3'
      }
    ],

    // 活动数据列表
    activityInfo:'',
    likeInfo:''
  },

  // 点击banner转至网页
  bannerUrl: function (e) {
    var bannerId = e.currentTarget.dataset.bannerId
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + bannerId
    })
  },

  // 关注与取消
  switchXin: function (e) {
    //console.log(this.data.item.ifLike)
    var id = e.currentTarget.dataset.acId;
    console.log(id);
    var item = this.data.activityInfo[id]
    var up = "activityInfo[" + id + "].ifLike"
    var that = this;
    if (item.ifLike == 1) {
      that.setData({
        [up]: 0,
        item: that.data.activityInfo[id]
      })
      for (let i = 0; i < that.data.likeInfo.length;i++)
      {
        if (that.data.activityInfo[id].id == that.data.likeInfo[i])
        {
          that.data.likeInfo.splice(i,1);
        }
      }
      wx.setStorage({
        key: 'acInfo',
        data: that.data.activityInfo
      })
      var sk = wx.getStorageSync(SESSION_KEY);
      wx.request({
        url: `${config.service.host}/weapp/uplike`,
        data:{
          likeId:that.data.likeInfo.join(','),
          skey:sk.skey
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
        [up]: 1,
        item: that.data.activityInfo[id]
      })
      that.data.likeInfo.push(that.data.activityInfo[id].id)
      var sk = wx.getStorageSync(SESSION_KEY);
      
      wx.request({
        url: `${config.service.host}/weapp/uplike`,
        data: {
          likeId: that.data.likeInfo.join(','),
          skey: sk.skey
        },
        success(res){
          //util.showSuccess('操作成功！')
        },
        fail(error){
          util.showModel('请求失败','网络连接失败')
        }
      })
      wx.setStorage({
        key: 'acInfo',
        data: that.data.activityInfo,
      })
    }
    
  },

  // 活动详情页 跳转函数
  trans: function (event) {
    var activityId = event.currentTarget.dataset.activityId
    //console.log(activityId);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + activityId
    })
  },

  onShow:function(options){
    var that = this;
    that.setData({
      likeInfo: wx.getStorageSync('likeInfo'),
      activityInfo:wx.getStorageSync('acInfo')
    })
    var list = timeJudge(that.data.activityInfo)
    that.setData({
      activityInfo: list
    })
    //console.log(that.data.likeInfo);
    
  },
  
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this
    wx.request({
      url: `${config.service.host}/weapp/demo`,
      //login: false,
      success(result) {
        //util.showSuccess('请求成功完成')
        console.log(result.data);
        var list = timeJudge(sort(result.data))  
        that.setData({
          activityInfo: list
        })
        that.setData({
          likeInfo: wx.getStorageSync('likeInfo'),
        })
        var x = 0, y = 0;
        for (x = 0; x < that.data.activityInfo.length; x++) {
          for (y = 0; y < that.data.likeInfo.length; y++) {
            if (that.data.likeInfo[y] == that.data.activityInfo[x].id) {
              that.data.activityInfo[x].ifLike = 1;
              that.setData({
                activityInfo: that.data.activityInfo,

              })
            }
          }
        }
        console.log(that.data.activityInfo);
        wx.setStorageSync('acInfo', that.data.activityInfo);
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
    
    
   
    
    
    
  },

  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    var list = timeJudge(this.data.activityInfo)  // 判断是否显示时间banner
    this.setData({
      activityInfo: list
    })
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: "校园活动通"
    }
  },
  
})


// 判断是否显示活动日期
function timeJudge(list) {
  const length = list.length
  var str = "1"
  for (let i = 0; i < length; i++) {
    var time = list[i].time.split(" ")[0]
    if (str == time) {
      list[i].showTime = 0
    }
    if (str != time) {
      list[i].showTime = 1
      str = time
      list[i].timeSimple = str
    }
  }
  return list
}

// 排序函数
function sort(list) {
  var len = list.length
  var newList = []
  newList.push(list[0])
  for (var i = 1; i < len; i++) {
    var timeList = divide(list[i])
    //console.log(timeList)
    var newLen = newList.length
    var hasIn = false
    for (var n = 0; n < newLen; n++) {
      var stList = divide(newList[n])
      //console.log(stList)
      if (timeList[0] <= stList[0]) {
        if (timeList[0] < stList[0]) {
          newList.splice(n, 0, list[i])
          hasIn = true
          break
        } else if (timeList[1] <= stList[1]) {
          if (timeList[1] < stList[1]) {
            newList.splice(n, 0, list[i])
            hasIn = true
            break
          } else if (timeList[2] <= stList[2]) {
            //console.log("2")
            //console.log(timeList[3])
            //console.log(stList[3])
            if (timeList[2] < stList[2]) {
              newList.splice(n, 0, list[i])
              hasIn = true
              break
            } else if (timeList[3] <= stList[3]) {
              //console.log(timeList[3])
              //console.log(stList[3])
              //console.log("3")
              if (timeList[3] < stList[3]) {
                newList.splice(n, 0, list[i])
                hasIn = true
                break
              } else if (timeList[4] <= stList[4]) {
                newList.splice(n, 0, list[i])
                hasIn = true
                break
              } else {
                continue
              }
            } else {
              continue
            }
          } else {
            continue
          }
        } else {
          continue
        }
      } else {
        continue
      }
    }
    if (hasIn == false) {
      newList.push(list[i])
    }
  }
  return newList
}

function divide(list) {
  var str = list.time
  var strList = str.split(" ")[0].split("-").concat(str.split(" ")[1].split(":"))
  for (var i = 0, len = strList.length; i < len; i++) {
    strList[i] = parseInt(strList[i])
  }
  return strList
}
// 排序函数