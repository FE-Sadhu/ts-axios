// 这个文件作为整个项目中公共的类型定义文件
export type Method =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'

export interface AxiosRequestConfig {
  url?: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType
  timeout?: number
}

export interface AxiosResponse {
  // response 的值的类型
  data: any
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any // xmlHttpRequest 实例
}

export interface AxiosPromise extends Promise<AxiosResponse> {
  // axios() 的返回值是 promise 对象, 所以要继承自 promise<> 泛型接口，resolve 的参数就是 response 的值也就是 AxiosResponse 类型
}

export interface AxiosError extends Error {
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any // xhr 实例
  response?: AxiosResponse
}

export interface Axios {
  request(config: AxiosRequestConfig): AxiosPromise

  get(url: string, config?: AxiosRequestConfig): AxiosPromise
  delete(url: string, config?: AxiosRequestConfig): AxiosPromise
  options(url: string, config?: AxiosRequestConfig): AxiosPromise
  head(url: string, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
}

export interface AxiosInstance extends Axios {
  // 混合接口
  (config: AxiosRequestConfig): AxiosPromise
}
