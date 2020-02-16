/**
 * 发送请求前读取 cookie 用。
 * 这么写对象的目的是，以后有 write 方法的话也方便拓展。
 */

const cookie = {
  read(name: string): string | null {
    // 因为是用字符串去创建正表，非字面量去创建，所以 /s 的特殊字符 / 前需要加个 / 转义
    // 下面表示，匹配以 name 或 ;后面0个或多个空格 为开头，=零个或多个字符
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    return match ? decodeURIComponent(match[3]) : null
  }
}

export default cookie
