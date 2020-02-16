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
import 'nprogress/nprogress.css'
import NProgress from 'nprogress'

const instance = axios.create()

function calculatePercentage(loaded: number, total: number) {
  return Math.floor(loaded * 1.0) / total
}

function loadProgressBar() {
  const setupStartProgress = () => {
    instance.interceptors.request.use(config => {
      NProgress.start()
      return config
    })
  }

  const setupUpdateProgress = () => {
    const update = (e: ProgressEvent) => {
      console.log(e)
      NProgress.set(calculatePercentage(e.loaded, e.total))
    }
    instance.defaults.onDownloadProgress = update
    instance.defaults.onUploadProgress = update
  }

  const setupStopProgress = () => {
    instance.interceptors.response.use(response => {
      NProgress.done()
      return response
    }, error => {
      NProgress.done()
      return Promise.reject(error)
    })
  }

  setupStartProgress()
  setupUpdateProgress()
  setupStopProgress()
}

loadProgressBar()

const downloadEl = document.getElementById('download')

downloadEl!.addEventListener('click', e => {
  instance.get('https://img.mukewang.com/5cc01a7b0001a33718720632.jpg')
})

const uploadEl = document.getElementById('upload')

uploadEl!.addEventListener('click', e => {
  const data = new FormData()
  const fileEl = document.getElementById('file') as HTMLInputElement
  if (fileEl.files) {
    data.append('file', fileEl.files[0])

    instance.post('/more/upload', data)
  }
})