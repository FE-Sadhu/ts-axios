import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 若用户已经手动执行了 cancel() 方法，在异步分离执行 xhr.abort() 取消请求前，如果还有多的请求还没发送，在此处就让这些多的请求不发送，直接 throw reason
  throwCancellationRequested(config) // 因为异步执行的 xhr.abort()，所以在这异步操作有结果之前需要停止继续发送请求。如果多于请求则什么都不做。
  processConfig(config)
  return xhr(config).then(
    res => {
      return transformResponseData(res)
    },
    e => {
      // 请求失败的话也对 response.data 作处理
      if (e && e.response) {
        e.response = transformResponseData(e.response)
      }
      return Promise.reject(e)
    }
  )
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transform(config.data, config.headers, config.transformRequest)

  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config

  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }

  return buildURL(url!, params, paramsSerializer) // 断定参数不会为空，直接加个 ! 就行
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

function throwCancellationRequested(config: AxiosRequestConfig) {
  if (config.cancelToken) {
    // 证明用户配置了 cancelToken
    config.cancelToken.throwIfRequested() // 内部判断用户是否执行了 cancel() ，若执行过了，抛出原因，停止继续发送请求。否则啥也不做
  }
}
