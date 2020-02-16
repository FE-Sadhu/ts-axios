import { AxiosRequestConfig } from '../types/index'
import { isPlainObject, deepMerge } from '../helpers/utill'
/**
 * 利用多个合并策略合并默认配置与自定义配置
 *
 * 为什么需要多个合并策略，由实际出去，config 中的 url 和 data、params 等是必须依照用户的来的，因为不同场景这些肯定不同。
 * 但是 headers 字段的话，就得由默认配置和自定义配置合并而来。
 * 正因为不是单纯的自定义配置覆盖默认配置，所以需要定义多个合并策略来帮助合并。
 */

// 合并策略1 -> val2 存在则覆盖 val1
function defaultStrat(val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}
// 合并策略2 -> 忽略 val1 的值 (比如 url、data、params 等字段就需要忽略默认配置的值)
function fromVal2Strat(val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}
// 复杂对象的合并策略 -> 针对 headers 字段
function deepMergeStrat(val1: any, val2: any): any {
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2) // deep copy
  } else if (typeof val2 !== 'undefined') {
    // val2 不是对象，但存在
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 !== 'undefined') {
    return val1
  }
}

const strats = Object.create(null) // 建立一个策略函数的 map 映射关系

const stratKeysFromVal2 = ['url', 'params', 'data']
const stratKeysDeepMerge = ['headers', 'auth']

stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat // 特殊字段与对应策略函数的 map 映射
})
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig(
  config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig
): AxiosRequestConfig {
  if (!config2) {
    config2 = {}
  }

  const config = Object.create(null)

  for (let key in config2) {
    mergeField(key)
  }

  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat // 选取策略来合并
    config[key] = strat(config1[key], config2![key])
  }

  return config
}
