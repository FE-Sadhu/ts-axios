import { CancelExecutor } from '../types/index'

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
}
