/**
 * TODO: 区分环境 —— NODE_ENV
 * - whenDev ☞ process.env.NODE_ENV === 'development'
 * - whenTest ☞ process.env.NODE_ENV === 'test'
 * - whenProd ☞ process.env.NODE_ENV === 'production'
 */
const {
  when,
  whenDev,
  whenProd
  // whenTest,
} = require('@craco/craco');
const webpack = require('webpack');
const path = require('path');
const chalk = require('chalk');
// const CracoLessPlugin = require('craco-less');
const CracoAntDesignPlugin = require('craco-antd');
const CracoVtkPlugin = require('craco-vtk');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin'); // 查看打包的进度
const WebpackBar = require('webpackbar'); // 添加 进度条
// Replace Moment.js with Day.js in antd project in ONE step. Bundle size reduced from 65 kb -> 4.19 kb.
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin'); // 自动将输出文件夹打包zip文件
const CircularDependencyPlugin = require('circular-dependency-plugin'); // 循环引用检测
// 界面化展示  webpack 的输出，包含依赖的大小、进度和其他细节
const DashboardPlugin = require('webpack-dashboard/plugin');
const Dashboard = require('webpack-dashboard');
const dashboard = new Dashboard();
const TerserPlugin = require('terser-webpack-plugin'); // 压缩js
const CompressionWebpackPlugin = require('compression-webpack-plugin'); // gzip
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); // 打包分析
const fastRefreshCracoPlugin = require('craco-fast-refresh'); // 热更新
// 判断编译环境是否为生产
const isBuildAnalyzer = process.env.BUILD_ANALYZER === 'true';
const MODE = process.env.NODE_ENV;
console.log(chalk.red('MODE', MODE));
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const { outputName, open, port, target } = require('./src/config/app.config.js').config;
const pathResolve = (pathUrl) => path.join(__dirname, pathUrl);

module.exports = {
  webpack: {
    alias: {
      '@@': pathResolve('.'),
      '@': pathResolve('src'),
      '@assets': pathResolve('src/assets'),
      '@common': pathResolve('src/common'),
      '@components': pathResolve('src/components'),
      '@hooks': pathResolve('src/hooks'),
      '@pages': pathResolve('src/pages'),
      '@store': pathResolve('src/store'),
      '@utils': pathResolve('src/utils')
    },
    plugins: [
      // webpack构建进度条
      new WebpackBar({
        profile: true
      }),
      // 忽略第三方包指定目录，让这些指定目录不要被打包进去
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), //moment这个库中，如果引用了./locale/目录的内容，就忽略掉，不会打包进去
      // 时间转换工具采取day替换moment
      new AntdDayjsWebpackPlugin(),
      // // 新增模块循环依赖检测插件
      ...whenDev(
        () => [
          new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            // add errors to webpack instead of warnings
            failOnError: true,
            // allow import cycles that include an asyncronous import,
            allowAsyncCycles: false,
            cwd: process.cwd()
          }),
          // webpack-dev-server 强化插件
          new DashboardPlugin()
          // new DashboardPlugin(dashboard.setData),
        ],
        []
      ),
      /**
       * 编译产物分析
       *  - https://www.npmjs.com/package/webpack-bundle-analyzer
       * 新增打包产物分析插件
       */
      ...when(
        isBuildAnalyzer,
        () => [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static', // html 文件方式输出编译分析
            openAnalyzer: false,
            reportFilename: path.resolve(__dirname, `analyzer/index.html`)
          })
        ],
        []
      ),
      ...whenProd(
        () => [
          // 查看打包的进度
          // new SimpleProgressWebpackPlugin(),
          new TerserPlugin({
            // sourceMap: true, // Must be set to true if using source-maps in production
            terserOptions: {
              ecma: undefined,
              parse: {},
              compress: {
                warnings: false,
                drop_console: true, // 生产环境下移除控制台所有的内容
                drop_debugger: true, // 移除断点
                pure_funcs: ['console.log'] // 生产环境下移除console
              }
            }
          }),
          // 打包web文件夹 ---------- 已放到zipFile.js中去打包
          new FileManagerPlugin({
            onEnd: {
              mkdir: ['./zip'],
              delete: [
                //首先需要删除zip目录下的dist.zip
                // './zip/*.zip'
              ],
              // copy: [{ source: 'public/version.js', destination: outputName }],
              archive: [
                {
                  source: outputName,
                  destination: `./zip/${outputName}_${MODE}${new Date().getTime()}.zip`,
                  format: 'zip'
                }
              ]
            }
          }),
          // 打压gzip缩包
          new CompressionWebpackPlugin({
            algorithm: 'gzip',
            test: productionGzipExtensions,
            threshold: 1024,
            minRatio: 0.8
          })
        ],
        []
      )
    ],
    //抽离公用模块
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: 'initial',
            minChunks: 2,
            maxInitialRequests: 5,
            maxSize: 500,
            minSize: 0
          },
          vendor: {
            test: /node_modules/,
            chunks: 'initial',
            name: 'vendor',
            priority: 10,
            enforce: true,
            maxSize: 500
          }
        }
      }
    },
    /**
     * 重写 webpack 任意配置
     *  - configure 能够重写 webpack 相关的所有配置，但是，仍然推荐你优先阅读 craco 提供的快捷配置，把解决不了的配置放到 configure 里解决；
     *  - 这里选择配置为函数，与直接定义 configure 对象方式互斥；
     */
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = outputName; // 配合输出打包修改文件目录
      // webpackConfig中可以解构出你想要的参数比如mode、devtool、entry等等，更多信息请查看webpackConfig.json文件
      /**
       * 修改 output
       */
      webpackConfig.output = {
        ...webpackConfig.output,
        // ...{
        //   filename: whenDev(() => 'static/js/bundle.js', 'static/js/[name].js'),
        //   chunkFilename: 'static/js/[name].js'
        // },
        path: path.resolve(__dirname, outputName), // 修改输出文件目录
        publicPath: '/'
      };
      /**
       * webpack split chunks
       */
      // webpackConfig.optimization.splitChunks = {
      //   ...webpackConfig.optimization.splitChunks,
      //   ...{
      //     chunks: 'all',
      //     name: true
      //   }
      // }
      // 返回重写后的新配置
      return webpackConfig;
    }
  },
  babel: {
    plugins: [
      // 配置 babel-plugin-import  AntDesign 按需加载
      ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
      // 配置解析器 用来支持装饰器
      ['@babel/plugin-proposal-decorators', { legacy: true }]
    ]
  },
  /**
   * 新增 craco 提供的 plugin
   */
  plugins: [
    ...whenDev(
      () => [
        // {
        //   plugin: fastRefreshCracoPlugin
        // },
        {
          plugin: CracoVtkPlugin()
        }
      ],
      []
    ),
    // 方案1、配置Antd主题less
    // {
    //   plugin: CracoLessPlugin,
    //   options: {
    //     lessLoaderOptions: {
    //       lessOptions: {
    //         modifyVars: { '@primary-color': '#1DA57A' },
    //         javascriptEnabled: true
    //       }
    //     }
    //   }
    // },
    // 方案2、配置Antd主题
    // {
    //   plugin: CracoAntDesignPlugin,
    //   options: {
    //     customizeTheme: {
    //       '@primary-color': '#FF061C'
    //     }
    //   }
    // },
    // 方案3、配置Antd主题
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeThemeLessPath: path.join(__dirname, 'antd.customize.less')
      }
    }
  ],
  devServer: {
    port,
    open, // 自动打开浏览器
    proxy: {
      '/api': {
        target,
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        secure: false, // 如果是https接口，需要配置这个参数
        xfwd: false
      }
    }
  }
};
