import axios from '../../src/index'

// 第一种取消请求的方式
const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios.get('/cancel/get', {
  cancelToken: source.token
}).then(res => {
  console.log(res.data)
}).catch(function(e) {
  if (axios.isCancel(e)) {
    console.log('这是请求取消的信息:', e.message)
  }
})

setTimeout(() => { // 此时, 上面的 get 请求已经发出去了。
  source.cancel('用户手动取消请求')

  // 下面是取消请求随后又发一个请求，此时 cancelToken.reason 已经有值了，也就是上面已经执行 cancel() 了，下面这个请求不会发出，直接返回上面传入 cancel 的 reason
  axios.post('/cancel/post', { a: 1 }, { cancelToken: source.token }).catch(function(e) {
    if (axios.isCancel(e)) {
      console.log('取消请求后异步的 xhr.abort() 未执行前的多余请求：', e.message)
    }
  })
}, 100)

// 下面是第二种取消请求的方式
let cancel

axios.get('/cancel/get', {
  cancelToken: new CancelToken(c => {
    cancel = c
  })
}).then(res => {
  console.log(res.data)
}).catch(e => {
  if(axios.isCancel(e)) {
    console.log('第二种方式请求取消')
  }
})

setTimeout(() => {
  cancel()
}, 200)