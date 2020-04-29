// https://umijs.org/config/
import os from 'os';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';
import info from '../src/defaultInfo';

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      targets: {
        ie: 11,
      },
      locale: {
        enable: true, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
      },
      pwa: {
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
          importWorkboxFrom: 'local',
        },
      },
      ...(!process.env.TEST && os.platform() === 'darwin'
        ? {
            dll: {
              include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
              exclude: ['@babel/runtime'],
            },
            hardSource: true,
          }
        : {}),
    },
  ],
];

// 针对 preview.pro.ant.design 的 GA 统计代码
// 业务上不需要这个
if (process.env.APP_TYPE === 'site') {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
}

export default {
  // add for transfer to umi
  plugins,
  targets: {
    ie: 11,
  },
  define: {
    APP_TYPE: process.env.APP_TYPE || '',
  },
  // 路由配置
  routes: info.isIron ? pageRoutes : pageRoutes.splice(1,pageRoutes.length - 1),
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  hash:true,
  externals: {
    '@antv/data-set': 'DataSet',
  },
  // 服务器代理
  // 本地测试
  proxy: {
    '/restful/v2/sgp': {
      target: 'http://192.168.1.21:18065'
    },
    '/restful': {
      target: 'http://192.168.1.21:18066'
    },
    '/glodon': {
      target: 'http://192.168.1.21:18000'
    },
  },
  // 铁总测试
  // proxy: {
  //   '/crane/restful/': {
  //     target: 'http://192.168.1.25:18066/crane/restful/'
  //   },
  //   '/crane/restful/v2/tie/': {
  //     target: 'http://192.168.1.25:18066/crane/restful/v2/tie/'
  //   },
  //   '/crane/zftd/':{
  //     target: 'http://192.168.1.25:18066/crane/zftd/',
  //   }
  // },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = antdProPath
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  base:info.isIron ? '/zftdsd/crane' : '/',
  publicPath:info.isIron ? '/zftdsd/crane/' : '/',
  chainWebpack: webpackPlugin,
};
