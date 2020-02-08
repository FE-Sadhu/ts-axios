import axios from '../../src/index'
import qs from 'qs' // 这个例子中我们额外引入了 qs 库，它是一个查询字符串解析和字符串化的库。 编码或解析数据成 url 参数般形式。例子如下
/** 
 * qs 库的例子:
 * 
let params = { c: 'b', a: 'd' };
qs.stringify(params) 结果是 -> 'c=b&a=d'

let url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e';
let data = qs.parse(url.split('?')[1]);

// data的结果是
  {
      a: 1, 
      b: 2, 
      c: '', 
      d: xxx, 
      e: ''
  }
*/
axios.defaults.headers.common['test2'] = 123

axios({
  url: '/config/post',
  method: 'post',
  data: qs.stringify({ a: 1 }), // 例子中对于 {a:1} 经过 qs.stringify 变成 'a=1'。（formData 数据 -> 不配置 Content-Type 的话服务端就不能正确返回 Json 化的数据。当然我们已经默认配置了 config）
  headers: {
    test: '321'
  }
}).then(res => {
  console.log(res.data)
})
