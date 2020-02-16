import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName
    } = config

    const request = new XMLHttpRequest()

    if (responseType) {
      // 设置响应类型
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }

    if (withCredentials) {
      request.withCredentials = withCredentials
    }

    request.open(method.toUpperCase(), url!, true)

    request.onreadystatechange = function handleLoad() {
      // readyState 变化就会触发该事件
      if (request.readyState !== 4) {
        // 响应资源下载完 readyState 就为 4 ，参见 MDN
        return
      }

      if (request.status === 0) {
        // 网络错误、超时错误的时候 status 为 0
        return
      }
      const responseHeaders = parseHeaders(request.getAllResponseHeaders()) // 所有响应头
      const responseData = responseType !== 'text' ? request.response : request.responseText // 响应数据
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }

      handleResponse(response)
    }

    request.onerror = function handleError() {
      // 网络异常、比如不通的时候
      reject(createError('Network Error', config, null, request))
    }

    request.ontimeout = function handleTimeout() {
      // 超时
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request)) // 'ECONNABORTED' 是网络术语，表示被终止的请求
    }

    // 若有 token ,从 cookie 取出并放在请求头
    if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
      const token = cookie.read(xsrfCookieName)
      if (token && xsrfHeaderName) {
        headers[xsrfHeaderName] = token
      }
    }

    Object.keys(headers).forEach(name => {
      // 设置请求头
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    if (cancelToken) {
      cancelToken.promise.then(reason => {
        request.abort()
        reject(reason)
      })
    }

    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
