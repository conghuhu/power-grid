// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    oldFileID,
    newFileID,
    excelId,
  } = event;
  const log = cloud.logger();
  log.info({
    info: `接收到处理${excelId}的请求`,
    oldFileID,
    newFileID,
  })
  const res = await Promise.all([db.collection("excels").doc(excelId).update({
    data: {
      fileID: newFileID
    }
  }), cloud.deleteFile({
    fileList: [oldFileID]
  })])
  log.info({
    info: `处理结束${excelId}的请求`,
    data: res
  })
  return {
    res
  };
}