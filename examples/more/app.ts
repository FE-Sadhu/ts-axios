import axios from '../../src/index';

/**
 * 测试设置 withCredentials: true 后，跨域请求才能带上 cookie 的 demo .
 */

// document.cookie = 'a=b' // 设置的是发送请求的本域下的 cookie

// axios.get('/more/get').then(res => { // 同域请求自动带上目标域 cookie
//   console.log(res.data)
// })

// // 下面我们手动在网页上设置 http://127.0.0.1:8088/more/server2 域下的 cookie 为 'c=d'
// axios.post('http://127.0.0.1:8088/more/server2', {}, { // 跨域请求，需设置 withCredentials 为 true 后才能带上 cookie
//   withCredentials: true
// }).then(res => {
//   console.log(res.data)
// })

/**
 * 测试防御 xsrf 的 demo .
 */

const instance = axios.create({
  xsrfCookieName: 'XSRF-TOKEN-D',
  xsrfHeaderName: 'X-XSRF-TOKEN-D'
})

instance.get('/more/get').then(res => {
  console.log(res)
}).catch()
