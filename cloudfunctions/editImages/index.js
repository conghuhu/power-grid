const addImg = require('./addImg/index');
const removeImg = require('./removeImg/index');
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'addImg':
      return await addImg.main(event, context);
    case 'removeImg':
      return await removeImg.main(event, context);
  }
}