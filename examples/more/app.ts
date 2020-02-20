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

// const instance = axios.create({
//   xsrfCookieName: 'XSRF-TOKEN-D',
//   xsrfHeaderName: 'X-XSRF-TOKEN-D'
// })

// instance.get('/more/get').then(res => {
//   console.log(res)
// }).catch()

/**
 * 测试上传下载进度监控
 */

// import 'nprogress/nprogress.css'
// import NProgress from 'nprogress'

// const instance = axios.create()

// function calculatePercentage(loaded: number, total: number) {
//   return Math.floor(loaded * 1.0) / total
// }

// function loadProgressBar() {
//   const setupStartProgress = () => {
//     instance.interceptors.request.use(config => {
//       NProgress.start()
//       return config
//     })
//   }

//   const setupUpdateProgress = () => {
//     const update = (e: ProgressEvent) => {
//       console.log(e)
//       NProgress.set(calculatePercentage(e.loaded, e.total))
//     }
//     instance.defaults.onDownloadProgress = update
//     instance.defaults.onUploadProgress = update
//   }

//   const setupStopProgress = () => {
//     instance.interceptors.response.use(response => {
//       NProgress.done()
//       return response
//     }, error => {
//       NProgress.done()
//       return Promise.reject(error)
//     })
//   }

//   setupStartProgress()
//   setupUpdateProgress()
//   setupStopProgress()
// }

// loadProgressBar()

// const downloadEl = document.getElementById('download')

// downloadEl!.addEventListener('click', e => {
//   instance.get('https://img.mukewang.com/5cc01a7b0001a33718720632.jpg')
// })

// const uploadEl = document.getElementById('upload')

// uploadEl!.addEventListener('click', e => {
//   const data = new FormData()
//   const fileEl = document.getElementById('file') as HTMLInputElement
//   if (fileEl.files) {
//     data.append('file', fileEl.files[0])

//     instance.post('/more/upload', data)
//   }
// })

/**
 * 测试配置 auth
 */

// axios.post('/more/post', {
//   a: 1
// }, {
//   auth: {
//     username: 'Sadhu',
//     password: '123456'
//   }
// }).then(res => {
//   console.log(res)
// }).catch() // 服务端 server 处作了校验，能请求成功就证明通过了服务端校验。

/**
 * 自定义合法状态码 demo
 */

// axios.get('/more/304').then(res => {
//   console.log(res)
// }).catch(err => {
//   console.log(err.message)
// })


// axios.get('/more/304', {
//   validateStatus(status) {
//     return status >= 200 && status < 400
//   }
// }).then(res => {
//   console.log(res)
// }).catch(err => {
//   console.log(err.message)
// })

/**
 * 自定义 params 解析规则 demo 
 */

// import qs from 'qs'

// axios.get('/more/get', {
//   params: new URLSearchParams('a=b&c=d')
// }).then(res => {
//   console.log(res)
// }).catch()

// axios.get('/more/get', {
//   params: {
//     a: 1,
//     b: 2,
//     c: ['a', 'b', 'c']
//   }
// }).then(res => {
//   console.log(res)
// }).catch()

// const instance2 = axios.create({
//   paramsSerializer(params) {
//     return qs.stringify(params, { // 跟默认解析规则的区别是没有 decode 某些特殊字符。
//       arrayFormat: 'brackets'
//     })
//   }
// })

// instance2.get('/more/get', {
//   params: {
//     a: 1,
//     b: 2,
//     c: ['a', 'b', 'c']
//   }
// }).then(res => {
//   console.log(res)
// }).catch()

/**
 * 测试 BaseURL 
 */

// const instance3 = axios.create({
//   baseURL: 'https://img.mukewang.com/'
// })

// instance3.get('5cc01a7b0001a33718720632.gif')
// instance3.get('https://img.mukewang.com/szimg/5becd5ad0001b89306000338-360-202.jpg')

/**
 * 额外静态方法： Axios.all Axios.spread axios.Axios axios.getUri
 */

function getA() {
  return axios.get('/more/A')
} 
function getB() {
  return axios.get('/more/B')
}

axios.all([getA(), getB()]).then(axios.spread(function(resA, resB) {
  console.log(resA.data)
  console.log(resB.data)
})).catch()

axios.all([getA(), getB()]).then(([resA, resB]) => {
  console.log(resA.data)
  console.log(resB.data)
}).catch()

const fakeConfig = {
  baseURL: 'https://www.baidu.com',
  url: '/user/12345',
  params: {
    idClient: 1,
    idTest: 2,
    testString: 'thisIsATest'
  }
}

console.log('axios.getUri result: ', axios.getUri(fakeConfig))