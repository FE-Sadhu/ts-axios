// 通过 jasmine.Ajax.requests.mostRecent() 拿到最近一次请求的 request 对象，
// 这个 request 对象是 jasmine-ajax 库伪造的 xhr 对象，它模拟了 xhr 对象上的方法，
// 并且提供一些 api 让我们使用，比如 request.respondWith 方法返回一个响应。

export function getAjaxRequest(): Promise<JasmineAjaxRequest> {
  return new Promise(resolve => {
    setTimeout(() => {
      // 为什么需要异步返回呢？ 假如调用 getAjaxRequest 方法前有个异步发起的请求，这个方法为了获得最近一次的 xhr 对象必须也得异步获取。(例子可见拦截器的 test )
      resolve(jasmine.Ajax.requests.mostRecent()) // 返回一个 jasmine 框架伪造的 xhr 对象
    }, 0)
  })
}
