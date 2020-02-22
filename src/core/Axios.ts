import {
  AxiosRequestConfig,
  AxiosPromise,
  Method,
  AxiosResponse,
  ResolvedFn,
  RejectedFn
} from '../types/index'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './interceptorManager'
import mergeConfig from './mergeConfig'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig> // 类作为类型系统来描述
  response: InterceptorManager<AxiosResponse>
}

// 链式调用拦截器用到的接口 (所谓链式调用拦截器 -> 发送前后添加的拦截器先执行，响应后先添加的先执行)
interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn | undefined
}

export default class Axios {
  interceptors: Interceptors
  defaults: AxiosRequestConfig

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      // 此时 url 就等于是外界只传个 config 对象了
      config = url
    }

    // 传进来的 config 与 默认 config 合并
    config = mergeConfig(this.defaults, config)
    config.method = config.method.toLowerCase() // 如果是大写的话，后面 flattenHeaders 时会出错。

    // 链式调用拦截器
    const chain: PromiseChain<any>[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor) // 从前面添加
    })

    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    let promise = Promise.resolve(config)

    while (chain.length) {
      const { resolved, rejected } = chain.shift()! // ! 断言肯定 shift 取出来有值
      promise = promise.then(resolved, rejected)
    }

    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  getUri(config?: AxiosRequestConfig) {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  private _requestMethodWithoutData(
    method: Method,
    url: string,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method: method,
        url
      })
    )
  }

  private _requestMethodWithData(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method: method,
        url,
        data
      })
    )
  }
}
