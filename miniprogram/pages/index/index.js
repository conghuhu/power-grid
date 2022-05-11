// index.js
// const app = getApp()
import formatDate from '../../utils/formatDate';
import Dialog from "../../miniprogram_npm/vtuweapp/dialog/vtu-index";
Page({
  data: {
    excelLists: [],
    loading: true,
    excelLoading: false, // 文件上传的loading
    downSheetshow: false,
    downSheetList: [
      {
        label: '删除',
        color: 'red',
        loading: false,
        async: true,
      }
    ],
    currentExcelItemId: '',
    currentFileID: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // this.setData({
    //   loading: true
    // })
    // await this.getUserExcelList();
    // this.setData({
    //   loading: false
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    this.setData({
      loading: true
    })
    await this.getUserExcelList();
    this.setData({
      loading: false
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
  onPullDownRefresh: async function () {
    let that = this;
    this.setData({
      loading: true
    })
    await this.getUserExcelList();
    that.setData({
      loading: false
    })
    wx.stopPullDownRefresh();
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

  async getUserExcelList() {
    try {
      const res = await wx.getStorage({
        key: 'userInfo',
        encrypt: true,
      })
      const data = res.data;
      const db = wx.cloud.database();
      const list = await db.collection('excels').where({
        _openid: data.openid
      }).orderBy('updateTime', 'desc').get();
      // 格式化时间。
      const temp = list.data.map(item => {
        return {
          ...item,
          updateTime: formatDate(item.updateTime)
        }
      })
      this.setData({
        excelLists: temp
      });
      return Promise.resolve(true);
    } catch (error) {
      await wx.showToast({
        title: '获取信息失败',
        icon: 'error',
        duration: 1500
      });
      wx.redirectTo({
        url: '../login/index',
      });
    }
  },
  getOneExcelDetail: function (e) {
    const detail = e.target.dataset.detail;
    wx.navigateTo({
      url: `../excelTableDeatil/index?excelId=${detail._id}`,
    })
  },
  openDownDraw: function (e) {
    const currentId = e.target.dataset.currentid;
    const currentFileID = e.target.dataset.currentfileid;
    this.setData({
      downSheetshow: true,
      currentExcelItemId: currentId,
      currentFileID: currentFileID
    })
  },
  bindSelect: async function (e) {
    let self = this
    let index = e.detail.index;
    const db = wx.cloud.database();
    const currentId = this.data.currentExcelItemId;
    const currentFileID = this.data.currentFileID;
    switch (index) {
      case 0:
        Dialog().confirm({
          title: '确认删除？',
          content: '删除后不可恢复',
          confirmLabel: '确认',
          cancelLabel: '取消',
          success: async function (e) {
            Dialog("Vtu-Dialog").close()
            try {
              await Promise.all([db.collection('excels').doc(currentId).remove(), wx.cloud.deleteFile({
                fileList: [currentFileID]
              })])
              wx.showToast({
                title: "已删除",
                icon: 'none',
                duration: 2000
              });
            } catch (error) {
              console.trace(error);
              wx.showToast({
                title: "删除失败，请重试",
                icon: 'error',
                duration: 2000
              });
            }
            self.setData({
              downSheetshow: false,
              loading: true
            })
            await self.getUserExcelList();
            self.setData({
              loading: false
            })
          },
          fail: function () {
            self.setData({
              downSheetshow: false
            })
          }
        })
        break;
    }
  },

  /**
   * 选择excel表格
   */
  chooseExcel() {
    let that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        const file = res.tempFiles[0];
        let path = file.path;
        const fileName = file.name;
        const size = file.size;
        if (['xlsx', 'xls'].indexOf(fileName.split('.')[1]) != -1) {
          that.setData({
            excelLoading: true
          })
          that.uploadExcelToCloud(path, fileName, size);
        } else {
          wx.showToast({
            title: "请选择xlsx,xls文件",
            icon: 'error'
          })
        }
      }
    })
  },

  uploadExcelToCloud(path, key, size) {
    let that = this;
    wx.cloud.uploadFile({
      cloudPath: 'excels/' + new Date().getTime() + 'size' + size + key,
      filePath: path,
      success: res => {
        // console.log("上传成功", res.fileID);
        that.parseExcel(res.fileID);
      },
      fail: err => {
        console.log("上传失败", err);
      }
    })
  },

  parseExcel(fileId) {
    let that = this;
    wx.cloud.callFunction({
      name: "uploadExcel",
      data: {
        fileID: fileId,
        type: 'parseExcel',
      },
      success: res => {
        console.log("解析并上传成功", res);
        that.setData({
          excelLoading: false
        })
        wx.navigateTo({
          url: `../excelTableDeatil/index?excelId=${res.result._id}`,
        })
      },
      fail: err => {
        console.log("解析失败", err);
        wx.showToast({
          title: err.errMsg,
          icon: 'error'
        })
      }
    })
  }


});
