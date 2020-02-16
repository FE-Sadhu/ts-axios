/**
 * 整个流程就 7 步：
 * 1. 创建一个 request 实例。
 * 2. 执行 request.open 方法初始化。
 * 3. 执行 configureRequest 配置 request 对象。
 * 4. 执行 addEvents 给 request 添加事件处理函数。
 * 5. 执行 processHeaders 处理请求 headers。
 * 6. 执行 processCancel 处理请求取消逻辑。
 * 7. 执行 request.send 方法发送请求。
 */

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/utill'

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
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth
    } = config

    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    configureXMLHttpRequest()

    addEvent()

    processHeaders()

    processCancel()

    request.send(data)

    function configureXMLHttpRequest(): void {
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
    }

    function addEvent(): void {
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }

      request.onerror = function handleError() {
        // 网络异常、比如不通的时候
        reject(createError('Network Error', config, null, request))
      }

      request.ontimeout = function handleTimeout() {
        // 超时
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request)) // 'ECONNABORTED' 是网络术语，表示被终止的请求
      }

      request.onreadystatechange = function handleLoad() {
        // readyState 变化就会触发该事件
        if (request.readyState !== 4) {
          // 整个数据传输过程结束，不管本次请求是成功还是失败, readyState 就为 4 ,参见 MDN
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
    }

    function processHeaders(): void {
      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password) // btoa 是 base64 编码
      }

      if (isFormData(data)) {
        // 如果传的数据是 formData 类型的话，把默认配置或用户设置的 Content-Type 给删除掉。
        // 浏览器检查到传的数据是 formData 类型后，会自动设置 Content-Type 为 multipart/form-data
        delete headers['Content-Type']
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
    }

    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort()
          reject(reason)
        })
      }
    }

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
