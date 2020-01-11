/**
 * 工具辅助方法
 */

const toString = Object.prototype.toString

export function isDate(val: any): val is Date {
  // val is Date 是一种类型保护，之后在应用这个函数后，ide 会提示 val 有关 Date 的方法
  return toString.call(val) === '[object Date]'
}

export function isObject(val: any): val is Object {
  return val !== null && typeof val === 'object' // 对于 formData、Blob、ArrayBuffer 等对象 typeof 后都是 object,所以有了下面的判断普通对象
}

export function isPlainObject(val: any): val is Object {
  // 判断是否为普通对象。假如对于 formData 的话，toString 后会是 [object FormData]
  return toString.call(val) === '[object Object]'
}
