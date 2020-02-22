/**
 * 每次跑测试的时候都会率先执行 -> 由于配置了 setupFilesAfterEnv
 */

const JasmineCore = require('jasmine-core')
// @ts-ignore
// 为了让 jasmine-ajax 插件运行成功，我们需要手动添加全局的 getJasmineRequireObj 方法。这 hack ，在 jest 框架中用 jasmine 框架的插件就是这样的。
global.getJasmineRequireObj = function() {
  return JasmineCore
}
require('jasmine-ajax')
