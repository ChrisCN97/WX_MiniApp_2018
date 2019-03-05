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
    likeResult:'',
    auth:''
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
          qcloud.login({
            success(result) {
              if (result) {
                util.showSuccess('登录成功');
                that.setData({
                  userInfo: result,
                  logged: true
                })
                wx.setStorage({
                  key: 'userInf',
                  data: that.data.userInfo,
                })
                if (that.data.logged == true) {
                  var skey = wx.getStorageSync(SESSION_KEY);
                  skey = skey['skey'];

                  console.log(skey);

                  wx.request({
                    url: `${config.service.host}/weapp/getlike`,


                    data: {
                      uskey: skey,
                      test: 5
                    },
                    success(result) {
                      //util.showSuccess('请求成功完成')
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
                  wx.request({
                    url: `${config.service.host}/weapp/getauth`,
                    data: {
                      uskey: skey,
                    },
                    success(result) {

                      that.setData({
                        auth: result.data.auth_num,

                      })
                      wx.setStorage({
                        key: 'authInfo',
                        data: that.data.auth,
                      })
                    },
                    fail(error) {
                      util.showModel('请求失败', error);
                      console.log('request fail', error);
                    },
                  })
                  console.log(that.data.likeResult);
                }
                
              }
            }
          })
          /*wx.switchTab({
            url: '/pages/home/home'
          })*/
        } else {
          util.showModel('用户未授权', e.detail.errMsg);
        }
      }
    });
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
          wx.setStorage({
            key: 'userInf',
            data: that.data.userInfo,
          })
          if (that.data.logged == true) {
            var skey = wx.getStorageSync(SESSION_KEY);
            skey = skey['skey'];
      
            console.log(skey);

            wx.request({
              url: `${config.service.host}/weapp/getlike`,
              data: {
                uskey: skey,
                test: 5
              },
              success(result) {
                //util.showSuccess('请求成功完成')
                that.setData({
                  likeResult: result.data,

                })
                wx.setStorage({
                  key: 'likeInfo',
                  data: that.data.likeResult,
                })
              },
              fail(error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
              },
            })
            wx.request({
              url: `${config.service.host}/weapp/getauth`,
              data: {
                uskey: skey,
              },
              success(result) {
                
                that.setData({
                  auth: result.data.auth_num,

                })
                wx.setStorage({
                  key: 'authInfo',
                  data: that.data.auth,
                })
              },
              fail(error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
              },
            })


            console.log(that.data.likeResult);
          }
          wx.switchTab({
            url: '/pages/home/home'
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
              wx.setStorage({
                key: 'userInf',
                data: that.data.userInfo,
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
        util.showModel('您还未登陆', "请先登陆")
        console.log('登录失败', error)
      }
    })
  },

 



  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function (options) {

    this.login();

  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */

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