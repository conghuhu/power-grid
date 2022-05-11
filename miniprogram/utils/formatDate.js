export default function (time, format = 'YYYY-MM-DD HH:mm:ss') {
  // 获取年月日时分秒
  let y = time.getFullYear()
  let m = (time.getMonth() + 1).toString().padStart(2, '0')
  let d = time.getDate().toString().padStart(2, '0')
  let h = time.getHours().toString().padStart(2, '0')
  let min = time.getMinutes().toString().padStart(2, '0')
  let s = time.getSeconds().toString().padStart(2, '0')
  if (format === 'YYYY-MM-DD') {
    return `${y}-${m}-${d}`
  } else {
    return `${y}-${m}-${d} ${h}:${min}:${s}`
  }
}