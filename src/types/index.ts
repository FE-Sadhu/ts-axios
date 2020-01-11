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
  url: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType
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
