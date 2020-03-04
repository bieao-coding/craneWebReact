import analysis from './zh-CN/analysis';
import exception from './zh-CN/exception';
import form from './zh-CN/form';
import globalHeader from './zh-CN/globalHeader';
import login from './zh-CN/login';
import menu from './zh-CN/menu';
import monitor from './zh-CN/monitor';
import result from './zh-CN/result';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import pwa from './zh-CN/pwa';
import home from "./zh-CN/home";
import user from "./zh-CN/user";
import common from "./zh-CN/common";
import operator from "./zh-CN/operator";
import nvr from "./zh-CN/nvr";
import antiDevice from "./zh-CN/device";
import role from "./zh-CN/role";
import company from "./zh-CN/company";
import project from "./zh-CN/project";
import craneModel from "./zh-CN/craneModel";
import statistics from './zh-CN/statistics';
import crane from './zh-CN/crane';
import account from './zh-CN/account';
import contactPerson from './zh-CN/contactPerson';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.home.introduce': '介绍',
  'app.forms.basic.title': '基础表单',
  'app.forms.basic.description':
    '表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。',
  ...analysis,
  ...exception,
  ...form,
  ...globalHeader,
  ...login,
  ...home,
  ...user,
  ...common,
  ...role,
  ...company,
  ...operator,
  ...crane,
  ...nvr,
  ...antiDevice,
  ...project,
  ...craneModel,
  ...statistics,
  ...account,
  ...contactPerson,
  ...menu,
  ...monitor,
  ...result,
  ...settingDrawer,
  ...settings,
  ...pwa,
};
