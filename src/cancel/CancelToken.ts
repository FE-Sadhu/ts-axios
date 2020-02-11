import { CancelExecutor, CancelTokenSource, Canceler } from '../types/index'

interface ResolvePromise {
  (reason?: string): void
}
export default class CancelToken {
  promise: Promise<string>
  reason?: string

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    this.promise = new Promise<string>(resolve => {
      resolvePromise = resolve
    })

    executor(message => {
      if (this.reason) {
        // 保证只调用一次
        return
      }
      this.reason = message
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
