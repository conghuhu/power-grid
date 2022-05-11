const cloud = require('wx-server-sdk');
const ExcelJS = require('exceljs');
const formatDate = require('../utils/formatDate');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const log = cloud.logger();
  const {
    fileID
  } = event;

  const res = await cloud.downloadFile({
    fileID: fileID,
  })

  const buffer = res.fileContent;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  workbook.modified = new Date();
  let title = '';
  let deadLine = '';
  let fields = []; // 存储表格各个字段
  let content = [];
  workbook.eachSheet((worksheet, sheetId) => {
    log.info({
      worksheet,
      sheetId
    });
    if (worksheet.orderNo == workbook.worksheets.length - 1) {
      const imgs = worksheet.getImages();
      log.info({
        info: `fileID为${fileID}excel所包含的图片`,
        imgList: imgs
      })
      worksheet.eachRow((row, rowId) => {
        if (rowId == 1) {
          title = row.values[1] || row.values[2] || fileID;
        } else if (rowId == 2) {
          deadLine = row.values[1] || '';
        } else if (rowId == 3) {
          fields = row.values
        } else {
          const rowItem = new Object();
          fields.forEach((item, index) => {
            rowItem.id = rowId-4;
            currentCellValue = row.values[index];
            if (currentCellValue instanceof Date) {
              rowItem[item] = formatDate.formatDate(currentCellValue);
            } else {
              rowItem[item] = currentCellValue || null;
            }
          })
          content.push(rowItem);
        }
      })
    }
  })

  const addRes = await db.collection('excels').add({
    data: {
      _openid: wxContext.OPENID,
      fileID: fileID,
      updateTime: new Date(),
      title: title,
      content: content,
      fields: fields,
      deadLine: deadLine
    }
  })

  return addRes;
};
