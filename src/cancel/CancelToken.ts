/**
 * 取消功能主要就是利用 promise 做异步分离，外部调用 cancel 函数的时候会让 promise 状态变为 fulfilled,然后执行 xhr.abort()
 */

import { CancelExecutor, CancelTokenSource, Canceler } from '../types/index'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    executor(message => {
      if (this.reason) {
        // 保证只调用一次
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  static source(): CancelTokenSource {
    // 类似工厂函数
    let cancel!: Canceler // 这里为什么要断言，因为下面 return 出去的时候的 cancel 可能认为没赋上值
    const token = new CancelToken(c => {
      cancel = c
    })

    return {
      token,
      cancel
    }
  }
}
