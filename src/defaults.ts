/**
 * 内部默认配置(config)
 */

import { AxiosRequestConfig } from './types'

const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      // 自定义设置 common 字段，目的是，common 字段下的配置是不管发什么请求(get/post/put...)都需要加的通用请求头配置
      Accept: 'application/json, text/plain, */*'
    }
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
