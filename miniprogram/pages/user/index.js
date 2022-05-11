// pages/user/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: '',
    fileCount: 0,
    openid: '',
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    try {
      const res = await wx.getStorage({
        key: 'userInfo',
        encrypt: true,
      })

      const data = res.data;
      this.setData({
        avatarUrl: data.avatarUrl,
        nickName: data.nickName,
        openid: data.openid
      })
    } catch (error) {
      console.error(error)
    }
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
  downloadTemplete: async function () {
    this.setData({
      loading:true
    })
    const res = await wx.cloud.downloadFile({
      fileID: 'cloud://cloud1-3gye2f1r0b734920.636c-cloud1-3gye2f1r0b734920-1309820158/templete/实验空表格.xlsx'
    });
    await wx.openDocument({
      filePath: res.tempFilePath,
      fileType: 'xlsx',
      showMenu: true
    });
    this.setData({
      loading:false
    })
  }
})