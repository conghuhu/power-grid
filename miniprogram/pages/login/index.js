// pages/login/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fff',
    });

    wx.setNavigationBarTitle({
      title: '',
    });
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

  },

  async getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    const res = await wx.getUserProfile({
      desc: '用于身份认证', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    })
    console.log(res);
    wx.showLoading({
      title: '加载中',
    })

    const result = await wx.cloud.callFunction({
      name: "login",
      data: {
        userInfo: res.userInfo
      }
    });
    await wx.setStorage({
      key: "userInfo",
      data: Object.assign(res.userInfo, result.result),
      encrypt: true,
    })

    wx.switchTab({
      url: '/pages/index/index'
    })

  },
})