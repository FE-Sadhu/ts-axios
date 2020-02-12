import axios from '../../src/index';

document.cookie = 'a=b' // 设置的是发送请求的本域下的 cookie

axios.get('/more/get').then(res => { // 同域请求自动带上目标域 cookie
  console.log(res.data)
})

// 下面我们手动在网页上设置 http://127.0.0.1:8088/more/server2 域下的 cookie 为 'c=d'
axios.post('http://127.0.0.1:8088/more/server2', {}, { // 跨域请求，需设置 withCredentials 为 true 后才能带上 cookie
  withCredentials: true
}).then(res => {
  console.log(res.data)
})
