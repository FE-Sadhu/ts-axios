import { isPlainObject, deepMerge } from './utill'
import { Method } from '../types/index'
/**
 * 请求头的处理
 */

function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) return
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders(headers: any, data: any): any {
  // 处理请求头
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8' // 若没配置得自动加上，若不加服务端可能无法正确解析发送端发送过来的数据，自然可能无法正确显示 response body
    }
  }

  return headers
}

export function parseHeaders(headers: string): any {
  // 解析响应头，字符串变为对象
  let parsed = Object.create(null)
  if (!headers) {
    return parsed
  }

  headers.split('\r\n').forEach(line => {
    // 按回车符+换行符分割
    let [key, val] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return // 在 forEach 中是跳到下次循环
    }
    if (val) {
      val = val.trim()
    }
    parsed[key] = val
  })

  return parsed
}

// 处理 merge 默认 config 和自定义 config 后的 headers 字段
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}
