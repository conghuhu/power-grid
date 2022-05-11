// pages/excelTableDeatil/components/action_td/action_td.js

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
    },
    columns: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgList: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleClickItem(e) {
      this.triggerEvent('clickaction', {
        value: {
          type,
          index, item
        }
      })
      this.triggerEvent('onactionevent', {
        value: {
          type,
          index, item
        }
      })
    },
    imageChange: async function (e) {
      const { type } = e.currentTarget.dataset
      const { index, item } = this.data
      console.log(type);
      console.log("添加了图片", e)
      const currentImgList = e.detail.current;
      let that = this;
      let cloud = wx.cloud;
      const resList = await Promise.all(currentImgList.map((item) => {
        const path = item.url;
        const size = item.size;
        return cloud.uploadFile({
          cloudPath: 'scene_photos/' + new Date().getTime() + '_size' + size + '_img.jpg',
          filePath: path,
        })
      }))
      this.triggerEvent('clickaction', {
        value: {
          event: 'addImg',
          type,
          index:item.id,
          item,
          param: {
            imageFileID: resList[0].fileID
          }
        }
      })
    },
    removeImage: function (e) {
      const { type } = e.currentTarget.dataset
      const { index, item } = this.data
      console.log(type);
      this.triggerEvent('clickaction', {
        value: {
          event: 'removeImg',
          type,
          index:item.id,
          item,
          param: {
            imageFileID: item[type]
          }
        }
      })
    },
    confirmInput:function(e){
      const { type } = e.currentTarget.dataset;
      const { index, item } = this.data;
      const inputValue = e.detail.value;
      this.triggerEvent('clickaction', {
        value: {
          event: 'changeInput',
          type,
          index:item.id,
          item,
          param: {
            inputValue
          }
        }
      })
    }
  },

  lifetimes: {
    attached: function () { },
    ready: function () {
      const { item, columns } = this.data;
      const form = columns.form;
      if (form === 'IMG') {
        const imgUrl = item[columns.key];
        if (imgUrl) {
          const list = [{
            url: imgUrl
          }]
          this.setData({
            imgList: list
          })
        }
      } 
    },
    moved: function () { },
    detached: function () { },
  },
  pageLifetimes: {
    show: function () { },
    hide: function () { },
    resize: function () { },
  },
})
