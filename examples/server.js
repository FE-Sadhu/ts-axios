const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const multipart = require('connect-multiparty') // 通过这个中间件，我们就可以处理上传请求并且可以把上传的文件存储在 upload-file(自定义的名字) 目录下
const atob = require('atob') // nodejs 端的 base64 编码
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')
const path = require('path')

require('./server2')

const app = express()
const compiler = webpack(WebpackConfig) // compiler 是编译的结果

app.use(webpackDevMiddleware(compiler, { // 编译的结果直接作为中间件的参数
  publicPath: '/__build__/',
  stats: {
    colors: true,
    chunks: false
  }
}))

app.use(webpackHotMiddleware(compiler))

app.use(express.static(__dirname, { // 起服务器后，当前文件的静态资源目录
  setHeaders (res) {
    res.cookie('XSRF-TOKEN-D', '123abc') // 这是中间件的作用，等于在服务端为客户端种了 cookie => SetCookies('XSRF-TOKEN-D', '123abc')
  }
}))

app.use(bodyParser.json()) // parse 发送过来的 response body 的数据,这样才能在路由中 res.json(req.body) 才传得到数据
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser()) // 这才能在 res.json(req.cookies) 中拿得到设置的 cookie （被该中间件序列化后的 cookie ）

// 用于将文件上传到指定文件
app.use(multipart({
  uploadDir: path.resolve(__dirname, 'accept-upload-file')
}))

const router = express.Router()

registerSimpleRouter()

registerBaseRouter()

registerErrorRouter()

registerExtendRouter()

registerInterceptorRouter()

registerExtendRouter()

registerConfigRouter()

registerCancelRouter()

registerMoreRouter()

function registerSimpleRouter() {
  router.get('/simple/get', function(req, res) {
    res.json({
      msg: `hello world`
    })
  })
}

function registerBaseRouter() {
  router.get('/base/get', function(req, res) {
    res.json(req.query)
  })
  
  router.post('/base/post', function(req, res) {
    res.json(req.body)
  })
  
  router.post('/base/buffer', function(req, res) {
    let msg = []
    req.on('data', (chunk) => { // on 继承至 Node.js EventEmitter 类，事件监听
      chunk && msg.push(chunk)
    })
    req.on('end', () => {
      let buf = Buffer.concat(msg) // 通过 Buffer.concat 可以把一个数组转成一个 Buffer 对象
      res.json(buf.toJSON())
    })
  })
}

function registerErrorRouter() {
  router.get('/error/get', function(req, res) {
    if (Math.random() > 0.5) {
      res.json({
        msg: `hello world`
      })
    } else {
      res.status(500)
      res.end()
    }
  })
  
  router.get('/error/timeout', function(req, res) {
    setTimeout(() => {
      res.json({
        msg: `hello world`
      })
    }, 3000)
  })
}

function registerExtendRouter() {
  router.get('/extend/user', function(req, res) {
    res.json({
      code: 0,
      message: 'ok',
      result: {
        name: 'jack',
        age: 18
      }
    })
  })
}

function registerExtendRouter() {
  router.get('/extend/get', function(req, res) {
    res.json({
      msg: 'hello world'
    })
  })

  router.options('/extend/options', function(req, res) {
    res.end()
  })

  router.delete('/extend/delete', function(req, res) {
    res.end()
  })

  router.head('/extend/head', function(req, res) {
    res.end()
  })

  router.post('/extend/post', function(req, res) {
    res.json(req.body)
  })

  router.put('/extend/put', function(req, res) {
    res.json(req.body)
  })

  router.patch('/extend/patch', function(req, res) {
    res.json(req.body)
  })
}

function registerInterceptorRouter() {
  router.get('/interceptor/get', function (req, res) {
    res.end('hello')
  })
}

function registerConfigRouter() {
  router.post('/config/post', function (req, res) {
    res.json(req.body)
  })
}

function registerCancelRouter() {
  router.get('/cancel/get', function(req, res) {
    setTimeout(() => {
      res.json('hello')
    }, 1000)
  })

  router.get('/cancel/post', function(req, res) {
    setTimeout(() => {
      res.json(req.body)
    }, 1000)
  })
}

function registerMoreRouter() {
  router.get('/more/get', (req, res) => {
    res.json(req.cookies)
  })

  router.post('/more/upload', function(req, res) {
    console.log(req.body, req.files)
    res.end('upload success!')
  })

  // 用于服务端校验 auth 用
  router.post('/more/post', function(req, res) {
    const auth = req.headers.authorization
    const [type, credentials] = auth.split(' ')
    console.log(atob(credentials))
    const [username, password] = atob(credentials).split(':')
    if (type === 'Basic' && username === 'Sadhu' && password === '123456') {
      res.json(req.body)
    } else {
      res.end('UnAuthorization')
    }
  })
}

app.use(router)
const port = process.env.PORT || 8080
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})