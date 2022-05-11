const cloud = require('wx-server-sdk');
const ExcelJS = require('exceljs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const log = cloud.logger();
  const {
    excelId,
    fileID,
    dataList,
    fields,
    title
  } = event;
  log.info({
    info: "开始生成excel",
    excelId,
    fileID,
    dataList,
    fields,
  });
  const excelNativeFile = await cloud.downloadFile({
    fileID: fileID,
  })

  const readBuffer = excelNativeFile.fileContent;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(readBuffer);
  log.info({
    img: workbook.getImage(),
    excelId
  });
  /**
 * 
 * @param {图片文件cloudID} cloudID 
 * @param {图片列坐标} imgStartIndex 
 * @param {行坐标} index 
 * @param {图片大小} size 
 */
  const manipulatePicture = async (cloudID, imgStartIndex, index, size, worksheet) => {
    if (cloudID != null && cloudID != '') {
      log.info({
        info: '插入图片',
        col: imgStartIndex,
        row: index + 3
      })
      try {
        const [imgFile, tempURL] = await Promise.all([cloud.downloadFile({
          fileID: cloudID
        }), cloud.getTempFileURL({
          fileList: [
            cloudID
          ]
        })]);
        log.info(
          {
            imgFile,
            tempURL,
            info: '图片处理'
          }
        )
        const imageId = workbook.addImage({
          buffer: imgFile.fileContent,
          extension: 'jpg',
        });
        worksheet.addImage(imageId, {
          tl: { col: imgStartIndex, row: index + 3 },
          ext: { width: size, height: size },
          hyperlinks: {
            hyperlink: tempURL.fileList[0].tempFileURL,
            tooltip: cloudID
          }
        });
      } catch (error) {
        log.error({
          error,
          param: {
            cloudID, imgStartIndex, index, size
          }
        })
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
  // 1.扫描数据库，将content中的图片链接下载
  // 2.将其加入excel，获取其imageId
  // 3.将imageId插入其对应的单元格中。
  for (let [sheetIndex, worksheet] of workbook.worksheets.entries()) {
    if (worksheet.orderNo == workbook.worksheets.length - 1) {
      const size = (worksheet.getRow(3).height) / 72 * 96;
      // 遍历每一行row
      for (let [index, item] of dataList.entries()) {
        // 1. 将inputValue写入
        const inputValue = item['现场核查处理情况'];
        const inputIndex = fields.indexOf('现场核查处理情况');
        worksheet.getRow(index + 4).getCell(inputIndex + 1).value = inputValue;
        // 2. 处理图片
        const cloudID1 = item['现场核查照片1'];
        const cloudID2 = item['现场核查照片2'];
        const cloudID3 = item['现场核查照片3'];
        const imgStartIndex = fields.indexOf('现场核查照片1');
        await Promise.all([
          manipulatePicture(cloudID1, imgStartIndex, index, size, worksheet),
          manipulatePicture(cloudID2, imgStartIndex + 1, index, size, worksheet),
          manipulatePicture(cloudID3, imgStartIndex + 2, index, size, worksheet),
        ])
      }
    }
  }

  const writeBuffer = await workbook.xlsx.writeBuffer();

  const res = await cloud.uploadFile({
    cloudPath: 'excels/' + new Date().getTime() + '_rand' + Math.floor(Math.random() * 10000) + title + '.xlsx',
    fileContent: writeBuffer
  });
  cloud.callFunction({
    name: 'asyncExcel',
    data: {
      oldFileID: fileID,
      newFileID: res.fileID,
      excelId: excelId,
    }
  });

  return res;
};
