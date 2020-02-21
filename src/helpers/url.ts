/**
 * 根据传的 config 中的 params 拼接 url
 */

import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
  protocol: string
  host: string
}

function encode(val: string): string {
  return encodeURIComponent(val) // 等同于 decode 某些特殊字符
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':') // i 是大小写都不区分
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(
  url: string,
  params?: any,
  paramsSerializer?: (params: any) => void
): string {
  if (!params) {
    const markIndex = url.indexOf('#') // 处理 hash
    url = markIndex === -1 ? url : url.slice(0, markIndex)
    return url
  }

  let serializedParams // 序列化好后的 params

  if (paramsSerializer) {
    // 如果自定义了序列化参数的函数，则用用户自定义的方式去解析 params
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    // 如果传进来的 params 已经是 URLSearchParams 类型了，那它已经是序列化好后的 params 了，直接把 toString 后的 params 传给 serializedParams 就行。
    serializedParams = params.toString()
  } else {
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
          val = val.toISOString()
        } else if (isPlainObject(val)) {
          val = JSON.stringify(val)
        }
        parts.push(`${encode(key)}=${encode(val)}`)
      })
    })

    serializedParams = parts.join('&')
  }

  if (serializedParams) {
    const markIndex = url.indexOf('#') // 忽略 hash
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

// 判断是否是同域请求 -> 协议、域名、端口号
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)

  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

// 这里利用 a 标签来获得协议和主机
const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href) // 传入当前页面的 url ，得到当前页面的 protocol, host

// 找到传入 url 的协议和主机
function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode

  return {
    protocol,
    host
  }
}

// 判断传入的 url 是不是绝对路径
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

// 拼接 BaseURL + url
export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}
