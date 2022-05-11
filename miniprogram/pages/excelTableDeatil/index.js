// pages/excelTableDeatil/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    deadLine: '',
    loading: true,
    columns: [], // 全部列
    showColumns: [], // 展示的列
    allDataList: [], //全部的数据
    dataList: [], // 展示的数据
    excelId: '',
    fileID: '',
    showFieldProp: false,
    showSearchProp: false,
    pickerFieldIndex: 0, // 搜索选择器选择的字段index值
    pickerColumns: [], // picker选择器的列
    searchContent: '', // 搜索内容
    page: 1,
    pageCount: 10,
    tableLoading: true,
    pageSize: 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if (options == undefined || options == null) {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
    this.setData({
      excelId: options.excelId,
    })
    await this.init();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {

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
  async init() {
    this.setData({
      loading: true,
      tableLoading: true,
    })
    const db = wx.cloud.database();
    const res = await db.collection('excels').where({
      _id: this.data.excelId
    }).get();
    const data = res.data[0];
    const tempFields = [];
    const fieldsLen = data.fields.length; //34
    data.fields.forEach((item, index) => {
      item != null &&
        tempFields.push({
          title: item,
          key: item,
          type: (fieldsLen - 1 - index < 4) ? 'action' : undefined,
          form: (fieldsLen - 1 - index < 3) ? 'IMG' : ((fieldsLen - 1 - index == 3) ? 'INPUT' : 'COMMON')
        })
    });
    const showPropList = data.fields.filter((field) => field != null);
    const pickerColumns = showPropList.map((item, index) => {
      return {
        type: index, label: item
      }
    });
    const totalCount = data.content.length;
    const pageSize = this.data.pageSize;
    this.setData({
      loading: false,
      title: data.title,
      deadLine: data.deadLine,
      columns: showPropList,
      showColumns: tempFields,
      dataList: data.content.slice(0, pageSize),
      allDataList: data.content,
      fileID: data.fileID,
      tableLoading: false,
      pickerColumns:pickerColumns,
      pageCount: Math.floor(totalCount / pageSize) + 1
    });
  },
  // 点击table的action区域
  async handleClickAction(e) {
    let that = this;
    const { event, index, item, param, type } = e.detail.value;
    const db = wx.cloud.database();
    const excelId = this.data.excelId;
    switch (event) {
      case 'addImg':
        item[type] = param.imageFileID;
        await wx.cloud.callFunction({
          name: 'editImages',
          data: {
            type: 'addImg',
            excelId: excelId,
            rowIndex: index,
            fieldName: type,
            imageFileID: param.imageFileID,
            row: item
          }
        })
        that.data.dataList.splice(index, 1, item)
        break;
      case 'removeImg':
        item[type] = null;
        await wx.cloud.callFunction({
          name: 'editImages',
          data: {
            type: 'removeImg',
            excelId: excelId,
            rowIndex: index,
            fieldName: type,
            imageFileID: param.imageFileID,
            row: item
          }
        })
        that.data.dataList.splice(index, 1, item)
        break;
      case 'changeInput':
        console.log(e.detail.value);
        item[type] = param.inputValue;
        await db.collection('excels').doc(excelId).update({
          data: {
            ['content.' + index]: item,
          }
        })
        wx.showToast({
          title: `修改成功`,
        })
        break;
    }

  },
  // 如果有action 里面有对数据的操作 触发该事件
  handleOnActionEvent(e) {
    console.log(e)
  },
  async exportExcel() {
    let that = this;
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    const db = wx.cloud.database();
    try {
      const currentExcel = await db.collection("excels").doc(this.data.excelId).get();
      const res = await wx.cloud.callFunction({
        name: 'uploadExcel',
        data: {
          excelId: this.data.excelId,
          fileID: this.data.fileID,
          title: this.data.title,
          type: 'exportExcel',
          dataList: currentExcel.data.content,
          fields: this.data.columns
        }
      })
      const newFileID = res.result.fileID;
      const download = await wx.cloud.downloadFile({
        fileID: newFileID
      })
      await wx.openDocument({
        filePath: download.tempFilePath,
        fileType: 'xlsx',
        showMenu: true
      });
      wx.hideLoading();
      that.init();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: "error"
      })
    }
  },
  openSearchProp: function () {
    this.setData({
      showSearchProp: true,
    });
  },
  /**
   * 修改选中字段的index值
   * @param {*} e 
   */
  changePickerField: function (e) {
    this.setData({
      pickerFieldIndex: parseInt(e.detail.value)
    })
  },
  changeSearchContent: function (e) {
    this.setData({
      searchContent: e.detail.value
    })
  },
  search: function () {
    const field = this.data.columns[this.data.pickerFieldIndex];
    const searchContent = this.data.searchContent;
    this.setData({
      showSearchProp: false,
      loading: true,
    });
    const reg = new RegExp(searchContent);
    const allList = this.data.allDataList;
    const searchAfterList = allList.filter(item =>
      reg.test(item[field])
    );
    this.setData({
      dataList: searchAfterList,
      loading: false,
      pageSize: allList.length,
      pageCount: 1
    })
  },
  refresh: function () {
    this.setData({
      showSearchProp: false,
    })
    this.init();
  },
  openfieldboxProp: function () {
    this.setData({
      showFieldProp: true
    })
  },
  changeShowFieldList: function (e) {
    const fieldsLen = e.detail.value.length;
    const changeAfterFieldList = e.detail.value.map((item, index) => {
      return {
        title: item,
        key: item,
        type: (fieldsLen - 1 - index < 4) ? 'action' : undefined,
        form: (fieldsLen - 1 - index < 3) ? 'IMG' : ((fieldsLen - 1 - index == 3) ? 'INPUT' : 'COMMON')
      }
    });
    this.setData({
      showColumns: changeAfterFieldList
    })
  },
  /**
   * 翻页
   */
  paging_bind(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      page: index,
      tableLoading: true
    });
    const allList = this.data.allDataList;
    const pageSize = this.data.pageSize;
    const start = (index - 1) * pageSize;
    this.setData({
      dataList: allList.slice(start, start + pageSize),
      tableLoading: false
    })
  }
})