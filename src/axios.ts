import { AxiosInstance, AxiosRequestConfig } from './types/index'
import Axios from './core/Axios'
import { extend } from './helpers/utill'
import defaults from './defaults'

function createInstance(initConfig: AxiosRequestConfig): AxiosInstance {
  // 制造出多样的调用方式，混合对象（对象本身是 axios 函数，函数上又有一些属性）
  const context = new Axios(initConfig)
  const instance = Axios.prototype.request.bind(context)

  extend(instance, context)

  return instance as AxiosInstance
}

const axios = createInstance(defaults)

export default axios
