import { ResolvedFn, RejectedFn, AxiosInterceptorManage } from '../types/index'

interface Interceptor<T> {
  // 拦截器的接口
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> implements AxiosInterceptorManage<T> {
  private interceptor: Array<Interceptor<T> | null> // 一个数组，用来存储拦截器

  constructor() {
    this.interceptor = []
  }

  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptor.push({
      resolved,
      rejected
    })
    return this.interceptor.length - 1 // id 就是索引
  }

  eject(id: number): void {
    // const length = this.interceptor.length
    // if (id >= 0 && id < length) {
    //   this.interceptor.splice(id, 1) // 不能用 Splice ,因为会改变数组长度，而我们拦截器的 id 是用长度减一来的，所以取消拦截器不能改变数组长度
    // }
    if (this.interceptor[id]) {
      this.interceptor[id] = null
    }
  }

  // 传一个函数 fn 为参数,遍历私有变量 interceptor ，然后把每一个拦截器当做参数传给 fn 函数执行
  forEach(fn: (interceptor: Interceptor<T>) => void) {
    // ps: 这个 forEach 函数没有暴露在给外部看的接口 AxiosInterceptorManage 中，因为这个外部不需要，外部用户只需要知道怎么添加和杀出拦截器就行了
    this.interceptor.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }
}
