import { AxiosRequestConfig, AxiosResponse } from '../types/index'

export class AxiosError extends Error {
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse

  // super 继承对测试覆盖率支持的坑，目前没有好的解决方案，可以先忽略。下面那句注释就是单元测试可以忽略不测这个构造函数
  /* istanbul ignore next */
  constructor(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    request?: any,
    response?: AxiosResponse
  ) {
    super(message)

    this.config = config
    this.code = code
    this.request = request
    this.response = response
    this.isAxiosError = true

    Object.setPrototypeOf(this, AxiosError.prototype) // 手动设置一下原型，这是 TS 的坑，继承如 Error 等内置类的时候会出现的坑
  }
}

/**
 * 工厂模式，方便使用，不让外部 new ，封装个工厂函数制造对象，外部直接使用工厂函数就行
 */
export function createError(
  message: string,
  config: AxiosRequestConfig,
  code?: string | null,
  request?: any,
  response?: AxiosResponse
) {
  const error = new AxiosError(message, config, code, request, response)
  return error
}
