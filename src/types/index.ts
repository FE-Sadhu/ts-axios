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
  transformRequest?: AxiosTransformer | AxiosTransformer[] // 仅针对 post put patch，发出请求前修改请求数据
  transformResponse?: AxiosTransformer | AxiosTransformer[] //  在传递给 then/catch 前，允许修改响应数据
  cancelToken?: CancelToken // CancelToken() 的实例类型

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
  // 描述被使用的 axios() 的接口
  // 混合接口
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T> // 函数重载
}

export interface AxiosStatic extends AxiosInstance {
  // 扩展这个接口是因为 axios.create() 创造静态实例用
  create(config?: AxiosRequestConfig): AxiosInstance

  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  isCancel: (value: any) => boolean
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

export interface AxiosTransformer {
  (data: any, headers?: any): any
}

// 取消请求的第二种方式所需接口
export interface CancelToken {
  // CancelToken 的实例类型，对比下面的 CancelTokenStatic
  promise: Promise<Cancel> // <a>,这个 a 就是 resolve(参数) 方法的参数的类型,这里就是 reason
  reason?: Cancel // resolve 函数的参数

  throwIfRequested(): void // 判断是否执行过 cancel() 取消请求了，若有，做一些处理。
}

export interface Canceler {
  // 描述取消函数
  (message?: string): void
}

export interface CancelExecutor {
  // 传给 CancelToken() 构造函数的参数
  (cancel: Canceler): void
}

// 取消请求的第一种方式所需接口
export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}

export interface CancelTokenStatic {
  // CancelToken 的类类型,描述类的
  new (executor: CancelExecutor): CancelToken // 描述类的构造函数

  source(): CancelTokenSource // 类的静态方法
}

// Cancel 类
export interface Cancel {
  // Cancel 类的实例类型
  message?: string
}

export interface CancelStatic {
  // Cancel 类的类类型
  new (message?: string): Cancel
}
