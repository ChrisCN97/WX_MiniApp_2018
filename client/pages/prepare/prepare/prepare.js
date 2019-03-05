var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var constants = require('../../vendor/wafer2-client-sdk/lib/constants');
var SESSION_KEY = 'weapp_session_' + constants.WX_SESSION_MAGIC_ID;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    likeResult: '1',
  },

  login: function () {
    if (this.data.logged) return

    util.showBusy('正在登录')
    var that = this

    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
          util.showSuccess('登录成功');
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
              util.showSuccess('登录成功')
              that.setData({
                userInfo: result.data.data,
                logged: true
              })
              wx.switchTab({
                url: '/pages/home/home'
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

  bindGetUserInfo: function (e) {
    if (this.data.logged) return;

    util.showBusy('正在登录');

    var that = this;
    var userInfo = e.detail.userInfo;

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {

          // 检查登录是否过期
          wx.checkSession({
            success: function () {
              // 登录态未过期
              util.showSuccess('登录成功');
              that.setData({
                userInfo: userInfo,
                logged: true
              })
              wx.switchTab({
                url: '/pages/home/home'
              })
            },

            fail: function () {
              qcloud.clearSession();
              // 登录态已过期，需重新登录
              var options = {
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                userInfo: userInfo
              }
              that.doLogin(options);
            },
          });
        } else {
          util.showModel('用户未授权', e.detail.errMsg);
        }
      }
    });
    var skey = wx.getStorageSync(SESSION_KEY);
    var that = this;
    console.log(skey);
    wx.request({
      url: `${config.service.host}/weapp/getlike`,
      data: {
        uskey: skey
      },
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          likeResult: result.data
        })
        // console.log(likeResult);
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  doLogin: function (options) {
    var that = this;

    wx.login({
      success: function (loginResult) {
        var loginParams = {
          code: loginResult.code,
          encryptedData: options.encryptedData,
          iv: options.iv,
        }
        qcloud.requestLogin({
          loginParams, success() {
            util.showSuccess('登录成功');

            that.setData({
              userInfo: options.userInfo,
              logged: true
            })
            wx.switchTab({
              url: '/pages/home/home'
            })
          },
          fail(error) {
            util.showModel('登录失败', error)
            console.log('登录失败', error)
          }
        });
      },
      fail: function (loginError) {
        util.showModel('登录失败', loginError)
        console.log('登录失败', loginError)
      },
    });
  },

  // 切换是否带有登录态
  switchRequestMode: function (e) {
    this.setData({
      takeSession: e.detail.value
    })
    this.doRequest()
  },

  doRequest: function () {
    util.showBusy('请求中...')
    var that = this
    var options = {
      url: config.service.requestUrl,
      login: true,
      success(result) {
        util.showSuccess('请求成功完成')
        console.log('request success', result)
        that.setData({
          requestResult: JSON.stringify(result.data)
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    }
    if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
      qcloud.request(options)
    } else {    // 使用 wx.request 则不带登录态
      wx.request(options)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function (options) {
    /*
    setTimeout(function(){
      wx.switchTab({
        url: '/pages/home/home'
      })
    },2500
    )
    */
    this.login();
    console.log('!');
    var skey = wx.getStorageSync(SESSION_KEY);
    skey = skey['skey'];
    var that = this;
    console.log(skey);

    wx.request({
      url: `${config.service.host}/weapp/getlike`,


      data: {
        uskey: skey,
        test: 5
      },
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          likeResult: result.data,

        })
        wx.setStorage({
          key: 'likeInfo',
          data: that.data.likeResult,
        })
        var x = 0, y = 0;
        for (x = 0; x < that.data.activityInfo.length; x++) {
          for (y = 0; y < that.data.likeResult.length; y++) {
            if (that.data.likeResult[y] == that.data.activityInfo[x].id) {
              that.data.activityInfo[x].ifLike = 1;
              that.setData({
                activityInfo: that.data.activityInfo,

              })
            }
          }
        }
        // that.data.likeResult = that.data.likeResult[0].likeId;
        // console.log(this.data.likeResult);
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      },
    })


    console.log(this.data.likeResult);
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var skey = wx.getStorageSync(SESSION_KEY);
    skey = skey['skey'];
    var that = this;
    console.log('onShow');
    console.log(skey);
    wx.request({
      url: `${config.service.host}/weapp/getlike`,
      data: {
        uskey: skey
      },
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          likeResult: result.data
        })
        //console.log(this.data.likeResult);
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
    wx.getStorage({
      key: 'acInfo',
      success: function (res) {
        that.setData({
          activityInfo: res.data
        })
        var x = 0, y = 0;
        for (x = 0; x < that.data.activityInfo.length; x++) {
          for (y = 0; y < that.data.likeResult.length; y++) {
            if (that.data.likeResult[y] == that.data.activityInfo[x].id) {
              that.data.activityInfo[x].ifLike = 1;
              that.setData({
                activityInfo: that.data.activityInfo,
              })
            }
          }
        }
      },
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})