var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var constants = require('../../vendor/wafer2-client-sdk/lib/constants');
var SESSION_KEY = 'weapp_session_' + constants.WX_SESSION_MAGIC_ID;

Page({
  // 页面的初始数据
  
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    likeResult: '',
    auth:'',
    // 活动信息数据
    activityInfo: '',
    counter: 0,
    auth:wx.getStorageSync('authInfo')
  },
  
  login: function () {
    if (this.data.logged) return

   // util.showBusy('正在登录')
    var that = this
    
    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
         // util.showSuccess('登录成功');
          that.setData({
            userInfo: result,
            logged: true
          })
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            url: config.service.requestUrl,
            login: true,
            success(result) {
             // util.showSuccess('登录成功')
              that.setData({
                userInfo: result.data.data,
                logged: true
              })
            },

            fail(error) {
              util.showModel('请求失败', error)
              console.log('request fail', error)
            }
          })
        }
      },

      fail(error) {
        util.showModel('登录失败', "请手动点击登陆授权")
        console.log('登录失败', error)
      }
    })
  },



 


  // 取关函数
  clickIcon1: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.movieId;
    var up1 = "activityInfo[" + id + "].ifLike"
    var up2 = "activityInfo[" + id + "].showTime"
    var count = that.data.counter
    wx.showModal({
      title: '提示',
      content: '确认取消关注？',
      success: function (res) {
        if (res.confirm) {
          //console.log('用户点击确定')
          count--
          that.setData({
            [up1]: 0,
            [up2]: 0,
            counter: count
          })

          var list = timeJudge(sort(that.data.activityInfo))
          that.setData({
            activityInfo: list
          })

          for (let i = 0; i < that.data.likeResult.length; i++) {
            if (that.data.activityInfo[id].id == that.data.likeResult[i]) {
              that.data.likeResult.splice(i, 1);
            }
          }
          wx.setStorage({
            key: 'acInfo',
            data: that.data.activityInfo
          })
          var sk = wx.getStorageSync(SESSION_KEY);
          wx.request({
            url: `${config.service.host}/weapp/uplike`,
            data: {
              likeId: that.data.likeResult.join(','),
              skey: sk.skey
            },
            success(res) {
              util.showSuccess('操作成功！')
            },
            fail(error) {
              util.showModel('请求失败', '网络连接失败')
            }
          })
        }
        else{
          //console.log('用户点击取消')
          return 0
        }
      }
    })
  },
  trans: function (event) {
    var activityId = event.currentTarget.dataset.activityId
    //console.log(activityId);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + activityId
    })
  },

  // 跳至submit
  submit: function (event) {
    wx.navigateTo({
      url: '/pages/submit/submit'
    })
  },
  
  // 生命周期函数--监听页面加载
  onShow:function(options){
    
    if(this.data.logged==true){
    var skey = wx.getStorageSync(SESSION_KEY);
    skey=skey['skey'];
    var that = this;
    
    console.log('onShow');
    console.log(skey);
    
    wx.request({
      url: `${config.service.host}/weapp/getlike`,
      data: {
        uskey: skey
      },
      success(result) {
        //util.showSuccess('获取请求成功完成')
        that.setData({
          likeResult: result.data
        })
        wx.setStorage({
          key: 'likeInfo',
          data: result.data,
        })
        //console.log(this.data.likeResult);
        wx.getStorage({
          key: 'acInfo',
          success: function (res) {
            that.setData({
              activityInfo: res.data,
              counter: 0
            })
            
            var x = 0, y = 0;
            for (x = 0; x < that.data.activityInfo.length; x++) {
              that.data.activityInfo[x].ifLike = 0;
              for (y = 0; y < that.data.likeResult.length; y++) {
                if (that.data.likeResult[y] == that.data.activityInfo[x].id) {
                  that.data.activityInfo[x].ifLike = 1;
                  that.data.counter++;
                }
              }
              that.setData({
                activityInfo: that.data.activityInfo,
              })
              that.setData({
                counter: that.data.counter,
              })
            }
            var list = timeJudge(that.data.activityInfo)
            that.setData({
              activityInfo: list
            })
            var num = countList(that.data.activityInfo)
            that.setData({
              counter: num
            })
            wx.setStorageSync('acInfo', that.data.activityInfo)
          },
        })
        

        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
    }
  },

  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'acInfo',
      success: function(res) {
        that.setData({
          activityInfo:res.data
        })
      },
    })
    
    that.login();

    
    var count = 0;
    

    that.setData({
      userInfo: wx.getStorageSync('userInf'),
      likeResult: wx.getStorageSync('likeInfo'),
      
    })
    that.setData({
      counter: that.data.likeResult.length - 1
    })
    console.log('!');
    if(that.data.logged==true){
    var skey = wx.getStorageSync(SESSION_KEY);
    skey=skey['skey'];
    
    console.log(skey);
    
    var x = 0, y = 0;
    for (x = 0; x < that.data.activityInfo.length; x++) {
      for (y = 0; y < that.data.likeResult.length; y++) {
        if (that.data.likeResult[y] == that.data.activityInfo[x].id) {
          that.data.activityInfo[x].ifLike = 1;
          that.data.counter++;
          that.setData({
            activityInfo: that.data.activityInfo,

          })
        }
      }
    }
    /*that.setData({
      counter: that.data.likeResult.length - 1
    })*/
    wx.setStorage({
      key: 'acInfo',
      data: that.data.activityInfo
    })
    console.log(that.data.likeResult);
    }
  },
})

function countList(activityInfo) {
  const length = activityInfo.length
  var count = 0
  for (let i = 0; i < length; i++) {
    if (activityInfo[i].ifLike == 1) {
      count++
    }
  }
  return count
}

// 判断是否显示活动日期
function timeJudge(list) {
  const length = list.length
  var str = "1"
  for (let i = 0; i < length; i++) {
    var time = list[i].time.split(" ")[0]
    if (list[i].ifLike == 1 && str == time) {
      list[i].showTime = 0
    }
    if (list[i].ifLike == 1 && str != time) {
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