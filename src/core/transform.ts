import { AxiosTransformer } from '../types/index'
/**
 * 实现请求配置(transformRequest)和响应配置(transform)的逻辑
 */

// fns 是定义的转换函数( transformRequest/transformResponse 等)
export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
): any {
  if (!fns) {
    return data
  }

  if (!Array.isArray(fns)) {
    fns = [fns]
  }

  fns.forEach(fn => {
    data = fn(data, headers)
  })

  return data
}
