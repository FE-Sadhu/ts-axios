/**
 * 根据传的 config 中的 params 拼接 url
 */

import { isDate, isPlainObject } from './utill'

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/40%/g, '@')
    .replace(/%3A/gi, ':') // i 是大小写都不区分
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(url: string, params?: any): string {
  if (!params) {
    const markIndex = url.indexOf('#') // 处理 hash
    url = markIndex === -1 ? url : url.slice(0, markIndex)
    return url
  }
  const parts: string[] = [] // 每个 item 是键值对 key=val，见 34 行

  Object.keys(params).forEach(key => {
    const val = params[key]
    if (val === null || typeof val === 'undefined') {
      return // 跳出 forEach 的本轮循环，进入下一轮循环
    }

    let values = [] // 为不同 params 情况作统一处理用的临时数组
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }

    values.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    const markIndex = url.indexOf('#') // 忽略 hash
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}
