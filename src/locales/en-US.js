import analysis from './en-US/analysis';
import exception from './en-US/exception';
import form from './en-US/form';
import globalHeader from './en-US/globalHeader';
import login from './en-US/login';
import menu from './en-US/menu';
import monitor from './en-US/monitor';
import result from './en-US/result';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import pwa from './en-US/pwa';
import home from "./en-US/home";
import user from "./en-US/user";
import common from "./en-US/common";
import operator from "./en-US/operator";
import nvr from "./en-US/nvr";
import antiDevice from "./en-US/device";
import role from "./en-US/role";
import company from "./en-US/company";
import project from "./en-US/project";
import craneModel from "./en-US/craneModel";
import statistics from './en-US/statistics';
import crane from './en-US/crane';
import account from './en-US/account';
import contactPerson from './en-US/contactPerson';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.home.introduce': 'introduce',
  'app.forms.basic.title': 'Basic form',
  'app.forms.basic.description':
    'Form pages are used to collect or verify information to users, and basic forms are cranes in scenarios where there are fewer data items.',
  ...analysis,
  ...exception,
  ...form,
  ...globalHeader,
  ...login,
  ...menu,
  ...home,
  ...user,
  ...common,
  ...operator,
  ...nvr,
  ...antiDevice,
  ...role,
  ...crane,
  ...company,
  ...project,
  ...craneModel,
  ...statistics,
  ...account,
  ...monitor,
  ...contactPerson,
  ...result,
  ...settingDrawer,
  ...settings,
  ...pwa,
};
