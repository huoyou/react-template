/**
 * @module app.config
 * @author: huoyou
 * @description: 项目全局设置
 */
module.exports.config = {
  cookieExpires: 1, // cookie过期时间
  timeout: 6000, // axios超时时间
  apiUrl: process.env.VUE_APP_BASE_API || '', // 请求接口baseUrl
  homePage: 'home', // 项目首页名称
  outputName: 'dist', // 打包输出名称
  open: false, // 是否自动打开浏览器
  port: 9000, // 端口号
  target: 'http://localhost:7001', // 开发环境代理地址
  isGizp: false,
  isAnalyze: true
};
