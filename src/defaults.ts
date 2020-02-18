/**
 * 内部默认配置(config)
 */

import { AxiosRequestConfig } from './types'
import { processHeaders } from './helpers/headers'
import { transformRequest, transformResponse } from './helpers/data'

const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0, // 0 代表无超时时间
  headers: {
    common: {
      // 自定义设置 common 字段，目的是，common 字段下的配置是不管发什么请求(get/post/put...)都需要加的通用请求头配置
      Accept: 'application/json, text/plain, */*'
    }
  },

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  // 请求配置和响应配置可以理解为默认的拦截器功能，拦截器更灵活。
  transformRequest: [
    // 发送前的请求配置,只能用在 put post patch 这几个请求方法
    function(data: any, headers: any): any {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: [
    // 响应数据传给 then/catch 前的响应配置
    function(data: any): any {
      return transformResponse(data)
    }
  ],

  validateStatus(status: number): boolean {
    return status >= 200 && status < 300
  }
}

const methodsNoData = ['delete', 'get', 'head', 'options']

methodsNoData.forEach(method => {
  defaults.headers[method] = {} // 外部可以通过 axios.defaults.headers.method['xx'] = xx 配置修改对应 method 的默认请求头信息
})

const methodsWithData = ['post', 'put', 'patch']

methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
