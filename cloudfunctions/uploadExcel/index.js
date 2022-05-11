const parseExcel = require('./parseExcel/index');
const exportExcel = require('./exportExcel/index');


// 处理excel的云函数，解析excel，导出excel,删除excel
exports.main = async (event, context) => {
  switch (event.type) {
    case 'parseExcel':
      return await parseExcel.main(event, context);
    case 'exportExcel':
      return await exportExcel.main(event, context);
  }
}