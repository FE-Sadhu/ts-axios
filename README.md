# TS 重构 axios 总结

> 重构后的源码见：[Github](https://github.com/YxrSadhu/ts-axios)
>
> npm包见：[npmjs](https://www.npmjs.com/package/ts-axios-sadhu)

## target

1. 实现 axiso 浏览器端所有 feauture，精通 axiso 原理。 
2. 采用 TypeScript 重构。
3. 掌握从 0 到 1 发布一个 npm 包的过程。

## axios 浏览器端 features

1. 从浏览器中创建 XMLHttpRequest
2. 支持 Promise API
3. 拦截请求和响应
4. 转换请求数据和响应数据
5. 取消请求
6. 自动转换 JSON 数据
7. 客户端支持防御 XSRF
8. rest little features...

## 安装

使用 npm:

`$ npm install ts-axios-sadhu`

## 使用

与 [axios Example](https://github.com/axios/axios) 使用方式一致。

## 利用 axios 库发起一个请求的内部流程

画了个流程图：

![](https://user-gold-cdn.xitu.io/2020/2/26/17081f86eb0dd2a6?w=906&h=1758&f=png&s=225362)
> 若没加载出来可直接访问这个 url: https://user-gold-cdn.xitu.io/2020/2/26/17081f86eb0dd2a6?w=906&h=1758&f=png&s=225362

## 拦截器原理

先看用法：

```js
// 添加请求拦截器
axios.interceptors.request.use((config) => {
  // 在发送请求前做些啥 -----> 注意此时的 config 是 merge 后的 config ，可以访问任何配置信息。
  return config;
}, (error) => {
  // 请求错误时做些啥
  return Promise.reject(error)
})

// 添加响应拦截器
axios.interceptors.response.use((response) => {
  // 响应成功后做些啥
  return response
}, (error) => {
  // 响应失败时做些啥
  return Promise.reject(error)
})

// 移除拦截器
const id = axios.interceptors.request.use(......);
axios.interceptors.request.eject(id);
```

看用法可以目测出，和 promise 的 resolve 和 reject 很类似。实际上在内部也是利用 promise 处理的。

### 拦截器管理类

首先有个拦截器管理类 InterceptorManager ,管理用户添加、移除拦截器。

```typescript
// TS 版代码，有些接口类型没给出，但不影响阅读代码。

interface Interceptor<T> {
  // 拦截器的接口
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}
export default class InterceptorManager<T> {
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
```

看这个类的代码可以得到四个信息：

1. 内部维护个数组 `this.interceptor = []`来处理添加的拦截器。这个数组内部每个 item 的类型就是`Interceptor<T> | null`，也就是每个 item 就是一个拦截器。

2. 每调用一次 use(resolved, rejected)  就往数组中添加一个拦截器，并且返回这个拦截器在数组中的索引。

3. eject(id) 函数就负责把传入的 id ，对应数组中的索引，把该索引对应的拦截器 item 覆盖为 null。

4. 还可以看出这个管理类重写了 forEach(fn) 方法，接收一个参数为 interceptor (也就是每个拦截器 item )的函数，然后遍历自身维护的拦截器数组，如果某个数组的 item 不为 null ，就把该拦截器 item 作为参数传给 fn，并执行 fn 。

上面的第 4 点采用的技巧可以让外部编写的函数直接拿到内部某些信息(私有的)并处理，而不需要把内部的信息暴露出去。这是十分常见的技巧，要学会使用。

此时我们已经知道了添加拦截器是添加在哪里，移除拦截器是怎么做到的。那么是怎样做到让添加的请求拦截器、响应拦截器分别在适当的时刻执行呢？不急，你可以根据上面重写的 forEach 方法猜一猜，然后往下看。

### 利用 Promise 链式调用

在上面 axios 调用流程图中可以看出：

1. 在 dispatchRequest() 模块中处理下 config 然后调用 xhr() 模块就发起请求了。

2. 在 dispatchRequest() 之前仅仅只是 merge 了默认 config 和传入的 config ，还并没有对 url、params、data 等做处理，此时可以任意按规范修改 config。

3. 又因为在请求拿到结果后，xhr、dispatchRequest 函数依次出栈(call stack)，dispatchRequest() 的返回值能拿到 response 响应结果。（返回值类型：  `Promise<response>`）

所以就以上三点来说，我们以 dispatchRequest() 这个函数为中间媒介，在其前面执行请求拦截器逻辑，在其后面执行响应拦截器逻辑。

就此，axios 在其请求方法中利用一个数组和 Promise 方法做了一个很骚的链式调用处理，如下：

```ts
// request 请求方法定义在 Axios.ts 类中，其实就是暴露出去的给用户使用的那个 axios() 函数方法。

export default class Axios {
  interceptors: Interceptors
  defaults: AxiosRequestConfig

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = { // 拦截器属性
      request: new InterceptorManager<AxiosRequestConfig>(), // 创造个拦截器管理类实例
      response: new InterceptorManager<AxiosResponse>() // 拦截器管理类实例
    }
  }

  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      // 此时 url 就等于是外界只传个 config 对象了
      config = url
    }

    // 传进来的 config 与 默认 config 合并
    config = mergeConfig(this.defaults, config)
    config.method = config.method.toLowerCase() // 如果是大写的话，后面 flattenHeaders 时会出错。

    // 链式调用拦截器，重点在这里
    const chain: PromiseChain<any>[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor) // 从前面添加
    })

    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    let promise = Promise.resolve(config)

    while (chain.length) {
      const { resolved, rejected } = chain.shift()! // ! 断言肯定 shift 取出来有值
      promise = promise.then(resolved, rejected)
    }

    return promise
  }
}

```

#### 构建 chain 数组

先创建一个数组 chain 用来存储拦截器，给个初始值： 

```js
const chain = [{
  resolved: dispatchRequest,
  rejected: undefined
}]
```

然后把添加的请求拦截器按用户添加顺序挨个 unshift 到 chain 数组内，把添加的响应拦截器按用户添加顺序挨个 push 到 chain 数组内。

之后思路就是依次 shift 数组执行相应方法，所以对于用户来说，**先添加的请求拦截器后执行，先添加的响应拦截器先执行**。

#### 利用 Promise 实现链式调用 chain 数组

构建好 chain 数组后，想一想，位于请求拦截器和响应拦截器中间的 dispatchRequest() 等同于一个桥梁，他接收 config 返回 Promise.resolve(response)，要想接通这个桥梁实现从左到右依次执行数组 item，我可以利用 Promise 的 then(resolved, rejected) 方法。

```js
let promise = Promise.resolve(config); // 把 config 变成 promise.then(resolved, rejected) 中 resolved(config) 的参数

while(chain.length) {
  let {resolved, rejected} = chain.shfit();
  promise = promise.then(resolved, rejected);
}

return promise;
```

外部用户想要拿到的话直接用这个返回值 `promise.then(res => console.log(res))`就行了。

## 取消请求的原理

> Promise 是个好东西

先看用法：

```js
// 方式一
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('/user/12345', {
  cancelToken: source.token
}).catch(function(thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
     // 处理错误
  }
});

axios.post('/user/12345', {
  name: 'new name'
}, {
  cancelToken: source.token
})

// 取消请求（message 参数是可选的）
source.cancel('Operation canceled by the user.');

// 方式二
const CancelToken = axios.CancelToken;
let cancel;

axios.get('/user/12345', {
  cancelToken: new CancelToken(function executor(c) {
    // executor 函数接收一个 cancel 函数作为参数
    cancel = c;
  })
});

// cancel the request
cancel();
```

两个方式的内部原理其实是一样的，实现取消请求的方案均采用**异步分离**方式。

通过用法看出内部有定义了个 CancelToken 类，其实还有一个 Cancel 类，先来说 Cancel 类。

Cancel 类很简单，就是创建个有 message 属性的实例，message 对应的值就是取消时用户传入的原因。

```js
export default class Cancel {
  message?: string

  constructor(message?: string) {
    this.message = message
  }
}
```

接下来是 CancelToken 类，核心代码如下:

```ts
/**
 * 取消功能主要就是利用 promise 做异步分离，外部调用 cancel 函数的时候会让 promise 状态变为 fulfilled,然后执行 xhr.abort()
 */

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

  throwIfRequested() {
    // 判断是否一个请求被取消了(执行过 cancel() 了) -> 很简单，没执行过 cancel() 的话 this.reason 没赋值
    if (this.reason) {
      // 证明用户执行了 cancel() 方法
      throw this.reason
    }
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

```

CancelToken 类创造的实例包含  `reason`, `promise` 属性，这个 promise 属性是实现异步分离的关键，从代码结合用法一、二可以看出，用户给 config 中 cancelToken 属性配的值其实都是 CancelToken 类的实例，并且都往其构造函数中传入了一个函数:

```js
c => cancel = c
```

在 cancelToken 类中会执行这个函数，并把

```js
(message) => {
  if (this.reason) {
    // 保证只调用一次
    return
  }
  this.reason = new Cancel(message)
  resolvePromise(this.reason)
}
```

这个函数赋值给外部创建的 cancel 变量。当用户执行 cancel(message); 函数的时候，实际上执行的就是上面这个函数。

那么为什么执行如上函数就能取消请求呢？这时就要说起 CancelToken 实例的 promise 属性。

在 CancelToken 类的内部构造函数中创建了个 Promise 实例赋给 `this.promise` ，并且把内部的 resolve 函数分离出去给了 resolvePromise 变量：

```js
let resolvePromise: ResolvePromise

this.promise = new Promise<Cancel>(resolve => {
  resolvePromise = resolve // 把 resolve 函数分离出去给 resolvePromise 变量。
})
```

那么当用户执行 cancel 的时候调用 `resolvePromise(this.reason)`，就将 promise 属性对应的 Promise 实例的状态由 `pending` 变为 `fulfilled`，并把 reason 传递给 then 函数中的第一个参数函数的参数。

此前已有描述：实际上 config 中的 cancelToken 的值就是 CancelToken 类的实例，这个实例有 promise 属性。所以我们 xhr 模块中根据 config 的配置做一些逻辑处理时就可以这样子做：

```js
const { cancelToken } = config;

if (cancelToken) {
  cancelToken.promise.then(reason => {
    xhr.abort(); // 取消请求
    reject(reason); // 因为 xhr 模块使用 Promise 封装的，这里没贴出来。
  })
}
```

换句话说，当外部用户执行了 cancel() 函数时，这里的 then 函数的参数函数里面的逻辑才会执行，这里的逻辑也就是 `xhr.abort()` 取消请求了。

## 其他 features

其他 features 的实现都比较简单，感兴趣可以看源码。

## End

看完源码后就可以试着回答下诸如此类的问题了：

>  1.为什么 `axios` 既可以当函数调用，也可以当对象使用，比如`axios({})`、`axios.get`。
>
>  2.简述 `axios` 调用流程。
>
>  3.有用过拦截器吗？原理是怎样的？
>
>  4.有使用`axios`的取消功能吗？是怎么实现的？



最后想说学习源码要把源码中一些设计思想和骚操作学到才算一次成功的研究，不是非要把全部代码背下来之类的，所谓 **“好读书，不求甚解”** 大概就是如此吧~

