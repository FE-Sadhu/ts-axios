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

export function isFormData(val: any): val is FormData {
  return typeof val !== undefined && val instanceof FormData
}

export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== undefined && val instanceof URLSearchParams
}

export function extend<T, U>(to: T, from: U): U & T {
  // 辅助函数 -> 目的是把 from 上的属性都拓展到 to 中。包括原型上的属性
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }

  return to as T & U
}

// 自己实现个深拷贝，不用引入 lodash 那样考虑那么多情况，只考虑普通对象
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)

  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge(val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })

  return result
}
