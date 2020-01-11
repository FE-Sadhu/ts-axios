import { isPlainObject } from './utill'
/**
 * post 请求的 request body 数据或者 response body，也就是 config 中的 data 数据大部分情况下是对象，但是不能直接传
 * 需要把对象转化成 JSON 字符串(符合规范中的 USVString object)，这是 xhr.send(body) 的对于 body 的限制，不能直接传对象
 * 具体可参加 MDN https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
 */

export function transformRequest(data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  return data
}
