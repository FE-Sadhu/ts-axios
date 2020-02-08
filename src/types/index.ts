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

  [propName: string]: any
}

export interface AxiosResponse<T = any> {
  // 没有传入任何类型的时候，默认泛型参数 T 就是 any
  // response 的值的类型
  data: T
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any // xmlHttpRequest 实例
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {
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
  defaults: AxiosRequestConfig
  interceptors: {
    request: AxiosInterceptorManage<AxiosRequestConfig>
    response: AxiosInterceptorManage<AxiosResponse>
  }

  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T> // 加入泛型的目的是在请求的时候支持传入一个类型

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosInstance extends Axios {
  // 混合接口
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T> // 函数重载
}

export interface AxiosInterceptorManage<T> {
  // 拦截器管理器，可添加或删除拦截器
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number // 返回值 number 就是给 eject() 用来取消拦截器的

  eject(id: number): void
}

export interface ResolvedFn<T> {
  (val: T): T | Promise<T> // 返回的也可以是 promise 对象
}

export interface RejectedFn {
  (error: any): any
}
