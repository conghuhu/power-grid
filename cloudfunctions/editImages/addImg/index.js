const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  let res = {};
  const {
    excelId,
    rowIndex,
    fieldName,
    imageFileID,
    row
  } = event;
  const log = cloud.logger();
  try {
    res = await db.collection('excels').doc(excelId).update({
      data: {
        ['content.' + rowIndex]: row,
      }
    })
    log.info({
      res
    })
    return {
      success: true,
      data: res
    };
  } catch (error) {
    log.error({
      error
    })
    return {
      success: false
    }
  }

};
