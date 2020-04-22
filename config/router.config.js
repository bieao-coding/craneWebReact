
export default [
  // user
  {
    path: '/autoLogin',
    component: './AutoLogin/AutoLogin'
  },
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['Bearer'],
    routes: [
      // dashboard
      { path: '/', redirect: '/home'},
      {
        path:'/tie/tree',
        component: './Tie/Tie'
      },
      {
        path:'/home',
        name: 'home',
        icon: 'home',
        authority: ['home'],
        component: './Home/Home',
      },
      {
        path:'/system',
        name: 'system',
        icon: 'setting',
        authority: ['system'],
        routes:[
          // 用户管理
          {
            path:'/system/platformUser',
            name: 'platformUser',
            hideChildrenInMenu: true,
            authority: ['platformUser'],
            routes:[
              { path: '/system/platformUser', redirect: '/system/platformUser/table'},
              {
                path:'/system/platformUser/table',
                component: './PlatformUser/PlatformUser',
                authority: ['platformUser'],
              },
              {
                path:'/system/platformUser/add',
                component: './PlatformUser/form/platformUserForm',
                name: 'platformUser_add',
                authority: ['platformUser_add'],
              },
              {
                path:'/system/platformUser/addNext',
                component: './PlatformUser/form/platformUserForm',
                name: 'platformUser_addNext',
                authority: ['platformUser_addNext'],
              },
              {
                path:'/system/platformUser/edit',
                component: './PlatformUser/form/platformUserForm',
                name: 'platformUser_edit',
                authority: ['platformUser_edit'],
              },
              {
                path:'/system/platformUser/resetPassword',
                name: 'platformUser_resetPassword',
                authority: ['platformUser_resetPassword'],
              },
              {
                path:'/system/platformUser/setAuth',
                component: './PlatformUser/setAuth/setAuth',
                name: 'platformUser_setAuth',
                authority: ['platformUser_setAuth'],
                routes:[
                  {
                    path:'/system/platformUser/setAuth/workCompanyTree',
                    component: './PlatformUser/setAuth/auth/workCompanyTree',
                    authority: ['platformUser_setAuth'],
                  },
                  {
                    path:'/system/platformUser/setAuth/buildCompanyTree',
                    component: './PlatformUser/setAuth/auth/buildCompanyTree',
                    authority: ['platformUser_setAuth'],
                  },
                  {
                    path:'/system/platformUser/setAuth/supervisionCompanyTree',
                    component: './PlatformUser/setAuth/auth/supervisionCompanyTree',
                    authority: ['platformUser_setAuth'],
                  },
                  {
                    path:'/system/platformUser/setAuth/operators',
                    component: './PlatformUser/setAuth/auth/operators',
                    authority: ['platformUser_setAuth'],
                  },
                  {
                    path:'/system/platformUser/setAuth/nvr',
                    component: './PlatformUser/setAuth/auth/nvr',
                    authority: ['platformUser_setAuth'],
                  },
                  {
                    path:'/system/platformUser/setAuth/antiDev',
                    component: './PlatformUser/setAuth/auth/antiDev',
                    authority: ['platformUser_setAuth'],
                  },
                  {
                    path:'/system/platformUser/setAuth/videoDev',
                    component: './PlatformUser/setAuth/auth/videoDev',
                    authority: ['platformUser_setAuth'],
                  }
                ]
              },
            ]
          },
          // 角色管理
          {
            path:'/system/role',
            name: 'role',
            hideChildrenInMenu: true,
            authority: ['role'],
            routes:[
              { path: '/system/role', redirect: '/system/role/table'},
              {
                path:'/system/role/table',
                component: './Role/Role',
                authority: ['role'],
              },
              {
                path:'/system/role/add',
                component: './Role/form/roleForm',
                name: 'role_add',
                authority: ['role_add'],
              },
              {
                path:'/system/role/edit',
                component: './Role/form/roleForm',
                name: 'role_edit',
                authority: ['role_edit'],
              },
              {
                path:'/system/role/setAuth',
                component: './Role/auth/setAuth',
                name: 'role_auth',
                authority: ['role_auth'],
              }
            ]
          },
        ]
      },
      {
        path:'/base',
        name: 'base',
        icon: 'branches',
        authority: ['base'],
        routes:[
          // 单位管理
          {
            path:'/base/company',
            name: 'company',
            authority: ['company'],
            component: './Company/CompanyLayout',
            hideChildrenInMenu:true,
            routes:[
              {
                path:'/base/company/workCompany',
                name: 'workCompany',
                authority: ['workCompany'],
                routes:[
                  { path: '/base/company/workCompany', redirect: '/base/company/workCompany/table'},
                  {
                    path:'/base/company/workCompany/table',
                    component: './Company/layout/workCompany',
                    authority: ['workCompany'],
                  },
                  {
                    path:'/base/company/workCompany/add',
                    component: './Company/form/companyForm',
                    name: 'workCompany_add',
                    authority: ['workCompany_add'],
                  },
                  {
                    path:'/base/company/workCompany/addNext',
                    component: './Company/form/companyForm',
                    name: 'workCompany_addNext',
                    authority: ['workCompany_addNext'],
                  },
                  {
                    path:'/base/company/workCompany/edit',
                    component: './Company/form/companyForm',
                    name: 'workCompany_edit',
                    authority: ['workCompany_edit'],
                  },
                ]
              },
              {
                path:'/base/company/buildCompany',
                name: 'buildCompany',
                authority: ['buildCompany'],
                hideChildrenInMenu:true,
                routes:[
                  { path: '/base/company/buildCompany', redirect: '/base/company/buildCompany/table'},
                  {
                    path:'/base/company/buildCompany/table',
                    component: './Company/layout/buildCompany',
                    authority: ['buildCompany'],
                  },
                  {
                    path:'/base/company/buildCompany/add',
                    component: './Company/form/companyForm',
                    name: 'buildCompany_add',
                    authority: ['buildCompany_add'],
                  },
                  {
                    path:'/base/company/buildCompany/addNext',
                    component: './Company/form/companyForm',
                    name: 'buildCompany_addNext',
                    authority: ['buildCompany_addNext'],
                  },
                  {
                    path:'/base/company/buildCompany/edit',
                    component: './Company/form/companyForm',
                    name: 'buildCompany_edit',
                    authority: ['buildCompany_edit'],
                  },
                ]
              },
              {
                path:'/base/company/supervisionCompany',
                name: 'supervisionCompany',
                authority: ['supervisionCompany'],
                hideChildrenInMenu:true,
                routes:[
                  { path: '/base/company/supervisionCompany', redirect: '/base/company/supervisionCompany/table'},
                  {
                    path:'/base/company/supervisionCompany/table',
                    component: './Company/layout/supervisionCompany',
                    authority: ['supervisionCompany'],
                  },
                  {
                    path:'/base/company/supervisionCompany/add',
                    component: './Company/form/companyForm',
                    name: 'supervisionCompany_add',
                    authority: ['supervisionCompany_add'],
                  },
                  {
                    path:'/base/company/supervisionCompany/addNext',
                    component: './Company/form/companyForm',
                    name: 'supervisionCompany_addNext',
                    authority: ['supervisionCompany_addNext'],
                  },
                  {
                    path:'/base/company/supervisionCompany/edit',
                    component: './Company/form/companyForm',
                    name: 'supervisionCompany_edit',
                    authority: ['supervisionCompany_edit'],
                  },
                ]
              },
              {
                path:'/base/company/propertyCompany',
                name: 'propertyCompany',
                authority: ['propertyCompany'],
                hideChildrenInMenu:true,
                routes:[
                  { path: '/base/company/propertyCompany', redirect: '/base/company/propertyCompany/table'},
                  {
                    path:'/base/company/propertyCompany/table',
                    component: './Company/layout/propertyCompany',
                    authority: ['propertyCompany'],
                  },
                  {
                    path:'/base/company/propertyCompany/add',
                    component: './Company/form/companyForm',
                    name: 'propertyCompany_add',
                    authority: ['propertyCompany_add'],
                  },
                  {
                    path:'/base/company/propertyCompany/addNext',
                    component: './Company/form/companyForm',
                    name: 'propertyCompany_addNext',
                    authority: ['propertyCompany_addNext'],
                  },
                  {
                    path:'/base/company/propertyCompany/edit',
                    component: './Company/form/companyForm',
                    name: 'propertyCompany_edit',
                    authority: ['propertyCompany_edit'],
                  },
                ]
              },
            ]
          },
          // 工程管理
          {
            path:'/base/project',
            name: 'project',
            hideChildrenInMenu:true,
            authority: ['project'],
            routes:[
              { path: '/base/project', redirect: '/base/project/table'},
              {
                path:'/base/project/table',
                component: './Project/Project',
                authority: ['project'],
              },
              {
                path:'/base/project/add',
                component: './Project/form/projectForm',
                name: 'project_add',
                authority: ['project_add'],
              },
              {
                path:'/base/project/edit',
                component: './Project/form/projectForm',
                name: 'project_edit',
                authority: ['project_edit'],
              },
              {
                path:'/base/project/ext',
                component: './Project/form/extForm',
                name: 'project_ext',
                authority: ['project_ext'],
              },
            ]
          },
          // 人员管理
          {
            path:'/base/operator',
            name: 'operator',
            hideChildrenInMenu:true,
            authority: ['operator'],
            routes:[
              { path: '/base/operator', redirect: '/base/operator/table'},
              {
                path:'/base/operator/table',
                component: './Operator/Operator',
                authority: ['operator'],
              },
              {
                path:'/base/operator/add',
                component: './Operator/form/operatorForm',
                name: 'operator_add',
                authority: ['operator_add'],
              },
              {
                path:'/base/operator/edit',
                component: './Operator/form/operatorForm',
                name: 'operator_edit',
                authority: ['operator_edit'],
              },
              {
                path:'/base/operator/feature',
                component: './Operator/featureInfo/operatorFeature',
                name: 'operator_feature',
                authority: ['operator_feature'],
              },
            ]
          },
          // 塔机型号
          // {
          //   path:'/base/craneModel',
          //   name: 'craneModel',
          //   hideChildrenInMenu:true,
          //   authority: ['craneModel'],
          //   routes:[
          //     { path: '/base/craneModel', redirect: '/base/craneModel/table'},
          //     {
          //       path:'/base/craneModel/table',
          //       component: './CraneModel/CraneManufacturer',
          //       authority: ['craneModel'],
          //     },
          //     {
          //       path:'/base/craneModel/add',
          //       component: './CraneModel/form/manufacturer/manufacturerForm',
          //       name: 'craneModel_add',
          //       authority: ['craneModel_add'],
          //     },
          //     {
          //       path:'/base/craneModel/edit',
          //       component: './CraneModel/form/manufacturer/manufacturerForm',
          //       name: 'craneModel_edit',
          //       authority: ['craneModel_edit'],
          //     },
          //     {
          //       path:'/base/craneModel/model',
          //       name: 'model',
          //       authority: ['model'],
          //       routes:[
          //         { path: '/base/craneModel/model', redirect: '/base/craneModel/model/table'},
          //         {
          //           path:'/base/craneModel/model/table',
          //           component: './CraneModel/CraneModel',
          //           authority: ['model'],
          //         },
          //         {
          //           path:'/base/craneModel/model/add',
          //           component: './CraneModel/form/model/modelForm',
          //           name: 'model_add',
          //           authority: ['model_add'],
          //         },
          //         {
          //           path:'/base/craneModel/model/edit',
          //           component: './CraneModel/form/model/modelForm',
          //           name: 'model_edit',
          //           authority: ['model_edit'],
          //         },
          //       ]
          //     },
          //
          //   ]
          // },
          // NVR型号管理
          {
            path:'/base/nvrModel',
            name: 'nvrModel',
            hideChildrenInMenu:true,
            authority: ['nvrModel'],
            routes:[
              { path: '/base/nvrModel', redirect: '/base/nvrModel/table'},
              {
                path:'/base/nvrModel/table',
                component: './NvrModel/NvrModel',
                authority: ['nvrModel'],
              },
              {
                path:'/base/nvrModel/add',
                component: './NvrModel/form/nvrModelForm',
                name: 'nvrModel_add',
                authority: ['nvrModel_add'],
              },
              {
                path:'/base/nvrModel/edit',
                component: './NvrModel/form/nvrModelForm',
                name: 'nvrModel_edit',
                authority: ['nvrModel_edit'],
              },
            ]
          },
          // NVR管理
          {
            path:'/base/nvr',
            name: 'nvr',
            hideChildrenInMenu:true,
            authority: ['nvr'],
            routes:[
              { path: '/base/nvr', redirect: '/base/nvr/table'},
              {
                path:'/base/nvr/table',
                component: './Nvr/Nvr',
                authority: ['nvr'],
              },
              {
                path:'/base/nvr/add',
                component: './Nvr/form/nvrForm',
                name: 'nvr_add',
                authority: ['nvr_add'],
              },
              {
                path:'/base/nvr/edit',
                component: './Nvr/form/nvrForm',
                name: 'nvr_edit',
                authority: ['nvr_edit'],
              },
              {
                path:'/base/nvr/cancelPassword',
                name: 'nvr_cancelPassword',
                authority: ['nvr_cancelPassword'],
              },
              {
                path:'/base/nvr/show',
                component: './Nvr/showCranes/showCranes',
                name: 'nvr_show',
                authority: ['nvr_show'],
              },
            ]
          },
          // 联系人
          {
            path:'/base/contactPerson',
            name: 'contactPerson',
            hideChildrenInMenu:true,
            authority: ['contactPerson'],
            routes:[
              { path: '/base/contactPerson', redirect: '/base/contactPerson/table'},
              {
                path:'/base/contactPerson/table',
                component: './ContactPerson/ContactPerson',
                authority: ['contactPerson'],
              },
              {
                path:'/base/contactPerson/add',
                component: './ContactPerson/form/contactPersonForm',
                name: 'contactPerson_add',
                authority: ['contactPerson_add'],
              },
              {
                path:'/base/contactPerson/edit',
                component: './ContactPerson/form/contactPersonForm',
                name: 'contactPerson_edit',
                authority: ['contactPerson_edit'],
              },
              {
                name: 'contactPerson_delete',
                authority: ['contactPerson_delete'],
              },
            ]
          },
        ]
      },
      {
        path:'/crane',
        name: 'crane',
        icon: 'profile',
        hideChildrenInMenu:true,
        authority: ['crane'],
        component: './Crane/CraneLayout',
        routes:[
          { path: '/crane', redirect: '/crane/craneLayout/publicCompany' },
          {
            path:'/crane/craneLayout/publicCompany',
            component: './PublicCompany/PublicCompany',
            authority: ['crane'],
          },
          {
            path:'/crane/craneLayout/crane',
            component: './Crane/common/crane',
            authority: ['crane'],
          },
          {
            path:'/crane/craneLayout/crane/add',
            component: './Crane/form/craneForm',
            name:'crane_add',
            authority: ['crane_add']
          },
          {
            path:'/crane/craneLayout/crane/edit',
            component: './Crane/form/craneForm',
            name:'crane_edit',
            authority: ['crane_edit']
          },
          {
            path:'/crane/craneLayout/crane/operator',
            component: './Crane/bindOperator/bindOperator',
            name:'crane_operator',
            authority: ['crane_operator']
          },
          {
            path:'/crane/craneLayout/crane/cardRecord',
            component: './Crane/record/cardRecord',
            name:'crane_cardRecord',
            authority: ['crane_cardRecord']
          },
          {
            path:'/crane/craneLayout/crane/nvr',
            component: './Crane/bindNvr/bindNvr',
            name:'crane_nvr',
            authority: ['crane_nvr']
          },
          {
            path:'/crane/craneLayout/crane/bindRecord',
            component: './Crane/record/bindRecord',
            name:'crane_bindRecord',
            authority: ['crane_bindRecord']
          },
          {
            path:'/crane/craneLayout/crane/bindContact',
            name:'crane_bindContact',
            authority: ['crane_bindContact'],
            routes:[
              { path: '/crane/craneLayout/crane/bindContact', redirect: '/crane/craneLayout/crane/bindContact/table' },
              {
                path:'/crane/craneLayout/crane/bindContact/table',
                component: './Crane/bindContact/bindContact',
                authority: ['crane_bindContact'],
              },
              {
                path:'/crane/craneLayout/crane/bindContact/add',
                component: './Crane/bindContact/form/bindContactForm',
                name:'crane_bindContactAdd',
                authority: ['crane_bindContactAdd'],
              },
              {
                path:'/crane/craneLayout/crane/bindContact/copy',
                component: './Crane/bindContact/copy/bindContactCopy',
                name:'crane_bindContactCopy',
                authority: ['crane_bindContactCopy'],
              },
              {
                name:'crane_bindContactDelete',
                authority: ['crane_bindContactDelete'],
              },
              {
                name:'crane_bindContactSave',
                authority: ['crane_bindContactSave'],
              }
            ]
          },
          {
            path:'/crane/craneLayout/crane/ext',
            component: './Crane/form/extForm',
            name:'crane_ext',
            authority: ['crane_ext']
          },
        ]
      },
      {
        path:'/monitor',
        name: 'monitor',
        hideChildrenInMenu:true,
        icon: 'video-camera',
        authority: ['monitor'],
        component: './Monitor/MonitorLayout',
        routes:[
          { path: '/monitor', redirect: '/monitor/monitorLayout/publicCompany' },
          {
            path:'/monitor/monitorLayout/publicCompany',
            component: './PublicCompany/PublicCompany',
            authority: ['monitor'],
          },
          {
            path:'/monitor/monitorLayout/crane',
            component: './Monitor/cranes/all/craneLayout',
            name: 'monitor_all',
            authority: ['monitor_all'],
            routes:[
              {
                path:'/monitor/monitorLayout/crane/list',
                component: './Monitor/cranes/all/craneList',
                name: 'list',
                authority: ['list'],
              },
              {
                path:'/monitor/monitorLayout/crane/config',
                component: './Monitor/cranes/all/craneConfig',
                name: 'config',
                authority: ['config'],
              },
              {
                path:'/monitor/monitorLayout/crane/height',
                component: './Monitor/cranes/all/craneDraggingConfig',
                authority: ['config'],
              },
              {
                path:'/monitor/monitorLayout/crane/spread',
                component: './Monitor/cranes/all/craneSpread',
                name: 'spread',
                authority: ['spread'],
              },
              {
                path:'/monitor/monitorLayout/crane/history',
                component: './Monitor/cranes/all/craneHistory',
                name: 'history',
                authority: ['history'],
              },
              {
                path:'/monitor/monitorLayout/crane/sideView',
                component: './Monitor/cranes/signal/craneSideView',
                name: 'sideView',
                authority: ['sideView'],
              },
              {
                path:'/monitor/monitorLayout/crane/antiRunRecord',
                component: './Monitor/cranes/signal/antiRunRecord',
                name: 'antiRunRecord',
                authority: ['antiRunRecord'],
              },
              {
                path:'/monitor/monitorLayout/crane/workRunRecord',
                component: './Monitor/cranes/signal/workRunRecord',
                name: 'workRunRecord',
                authority: ['workRunRecord'],
              },
              {
                path:'/monitor/monitorLayout/crane/antiRunTime',
                component: './Monitor/cranes/signal/antiRunTime',
                name: 'antiRunTime',
                authority: ['antiRunTime'],
              },
              {
                path:'/monitor/monitorLayout/crane/videoLive',
                component: './Monitor/cranes/signal/videoLive',
                name: 'videoLive',
                authority: ['videoLive'],
              },
            ]
          },
        ]
      },
      {
        path:'/statistics',
        name: 'statistics',
        icon: 'area-chart',
        authority: ['statistics'],
        routes:[
          {
            path:'/statistics/warning',
            name: 'warning',
            authority: ['warning'],
            routes:[
              { path: '/statistics/warning', redirect: '/statistics/warning/warningLayout' },
              {
                path:'/statistics/warning/warningLayout',
                component: './Warning/WarningLayout',
                authority: ['warning'],
                routes:[
                  { path: '/statistics/warning/warningLayout', redirect: '/statistics/warning/warningLayout/show' },
                  {
                    path:'/statistics/warning/warningLayout/show',
                    component: './Warning/show/warningShow',
                    authority: ['warning'],
                  },
                ]
              },
            ]
          },
          {
            path:'/statistics/alarm',
            name: 'alarm',
            authority: ['alarm'],
            routes:[
              { path: '/statistics/alarm', redirect: '/statistics/alarm/alarmLayout' },
              {
                path:'/statistics/alarm/alarmLayout',
                component: './Alarm/AlarmLayout',
                authority: ['alarm'],
                routes:[
                  { path: '/statistics/alarm/alarmLayout', redirect: '/statistics/alarm/alarmLayout/show' },
                  {
                    path:'/statistics/alarm/alarmLayout/show',
                    component: './Alarm/show/alarmShow',
                    authority: ['alarm'],
                  },
                ]
              },
            ]
          },
          {
            path:'/statistics/peccancy',
            name: 'peccancy',
            authority: ['peccancy'],
            routes:[
              { path: '/statistics/peccancy', redirect: '/statistics/peccancy/peccancyLayout' },
              {
                path:'/statistics/peccancy/peccancyLayout',
                component: './Peccancy/PeccancyLayout',
                authority: ['peccancy'],
                routes:[
                  { path: '/statistics/peccancy/peccancyLayout', redirect: '/statistics/peccancy/peccancyLayout/show' },
                  {
                    path:'/statistics/peccancy/peccancyLayout/show',
                    component: './Peccancy/show/peccancyShow',
                    authority: ['peccancy'],
                  },
                ]
              },
            ]
          },
          {
            path:'/statistics/workLevel',
            name: 'workLevel',
            authority: ['workLevel'],
            routes:[
              { path: '/statistics/workLevel', redirect: '/statistics/workLevel/workLevelLayout' },
              {
                path:'/statistics/workLevel/workLevelLayout',
                component: './WorkLevel/WorkLevelLayout',
                authority: ['workLevel'],
                routes:[
                  { path: '/statistics/workLevel/workLevelLayout', redirect: '/statistics/workLevel/workLevelLayout/show' },
                  {
                    path:'/statistics/workLevel/workLevelLayout/show',
                    component: './WorkLevel/show/workLevelShow',
                    authority: ['workLevel'],
                  }
                ]
              }
            ]
          },
          {
            path:'/statistics/workTime',
            name: 'workTime',
            authority: ['workTime'],
            routes:[
              { path: '/statistics/workTime', redirect: '/statistics/workTime/workTimeLayout' },
              {
                path:'/statistics/workTime/workTimeLayout',
                component: './WorkTime/WorkTimeLayout',
                authority: ['workTime'],
                routes:[
                  { path: '/statistics/workTime/workTimeLayout', redirect: '/statistics/workTime/workTimeLayout/show' },
                  {
                    path:'/statistics/workTime/workTimeLayout/show',
                    component: './WorkTime/show/workTimeShow',
                    authority: ['workTime'],
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path:'/device',
        name: 'device',
        icon: 'hdd',
        authority: ['device'],
        routes:[
          {
            path:'/device/anti',
            name: 'anti',
            authority: ['anti'],
            routes:[
              {
                path:'/device/anti/list',
                name: 'antiList',
                hideChildrenInMenu:true,
                authority: ['antiList'],
                routes:[
                  { path: '/device/anti/list', redirect: '/device/anti/list/table'},
                  {
                    path:'/device/anti/list/table',
                    component: './Anti/AntiList',
                    authority: ['antiList'],
                  },
                  {
                    path:'/device/anti/list/add',
                    component: './Anti/form/antiForm',
                    name:'antiList_add',
                    authority: ['antiList_add'],
                  },
                  {
                    path:'/device/anti/list/record',
                    component: './Anti/record/record',
                    name:'antiList_record',
                    authority: ['antiList_record'],
                  },
                ]
              },
              {
                path:'/device/anti/versions',
                name: 'antiVersion',
                hideChildrenInMenu:true,
                authority: ['antiVersion'],
                routes:[
                  { path: '/device/anti/versions', redirect: '/device/anti/versions/table'},
                  {
                    path:'/device/anti/versions/table',
                    component: './AntiVersion/AntiVersion',
                    authority: ['antiVersion'],
                  },
                  {
                    path:'/device/anti/versions/add',
                    component: './AntiVersion/form/antiVersionForm',
                    name:'anti_versions_add',
                    authority: ['anti_versions_add'],
                  },
                  {
                    name:'anti_versions_delete',
                    authority: ['anti_versions_delete'],
                  },
                ]
              },
              {
                path:'/device/anti/param',
                name: 'param',
                component: './AntiParam/AntiParam',
                authority: ['param'],
                hideChildrenInMenu:true,
                routes:[
                  { path: '/device/anti/param', redirect: '/device/anti/param/layout/publicCompany' },
                  {
                    path:'/device/anti/param/layout/publicCompany',
                    component: './PublicCompany/PublicCompany',
                    authority: ['param'],
                  },
                  {
                    path:'/device/anti/param/layout/crane',
                    component: './AntiParam/common/craneParam',
                    authority: ['param'],
                  },
                  {
                    path:'/device/anti/param/layout/crane/set',
                    component: './AntiParam/form/antiParamForm',
                    authority: ['param'],
                    routes:[
                      {
                        path:'/device/anti/param/layout/crane/set/craneStructure',
                        component: './AntiParam/form/craneStructure',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/antiStructure',
                        component: './AntiParam/form/antiStructure',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/torqueAndWind',
                        component: './AntiParam/form/torqueAndWind',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/craneAlarmAndWarning',
                        component: './AntiParam/form/craneAlarmAndWarning',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/craneAlarmAndWarning',
                        component: './AntiParam/form/craneAlarmAndWarning',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/devicePassword',
                        component: './AntiParam/form/devicePassword',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/versionSetting',
                        component: './AntiParam/form/versionSetting',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/areaWarning',
                        component: './AntiParam/form/areaWarning',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/windSensor',
                        component: './AntiParam/form/windSensor',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/belongProject',
                        component: './AntiParam/form/belongProject',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/masterVersion',
                        component: './AntiParam/form/masterVersion',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/serviceStatus',
                        component: './AntiParam/form/serviceStatus',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/angularLimit',
                        component: './AntiParam/form/angularLimit',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/craneUp',
                        component: './AntiParam/form/craneUp',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/craneArea',
                        component: './AntiParam/form/craneArea',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/towerGroup',
                        component: './AntiParam/form/towerGroup',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/towerGroupForm',
                        component: './AntiParam/form/towerGroupForm',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/systemSwitch',
                        component: './AntiParam/form/systemSwitch',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/deviceLocked',
                        component: './AntiParam/form/deviceLocked',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/byPass',
                        component: './AntiParam/form/byPass',
                        authority: ['param'],
                      },
                      {
                        path:'/device/anti/param/layout/crane/set/fall',
                        component: './AntiParam/form/ropeFall',
                        authority: ['param'],
                      }
                    ]
                  },
                ]
              },
              {
                path:'/device/anti/update',
                name: 'antiUpdate',
                authority: ['antiUpdate'],
                component: './AntiUpdate/AntiUpdate',
                hideChildrenInMenu:true,
                routes:[
                  { path: '/device/anti/update', redirect: '/device/anti/update/publicCompany' },
                  {
                    path:'/device/anti/update/publicCompany',
                    component: './PublicCompany/PublicCompany',
                    authority: ['antiUpdate'],
                  },
                  {
                    path:'/device/anti/update/crane',
                    component: './AntiUpdate/update/update',
                    authority: ['antiUpdate'],
                  },
                  {
                    path:'/device/anti/update/versions',
                    component: './AntiUpdate/versions/updateVersions',
                    name:'antiUpdate_chooseVersion',
                    authority: ['antiUpdate_chooseVersion'],
                  },
                  {
                    name:'antiUpdate_currentVersion',
                    authority: ['antiUpdate_currentVersion'],
                  },
                  {
                    name:'antiUpdate_start',
                    authority: ['antiUpdate_start'],
                  },
                  {
                    name:'antiUpdate_cancel',
                    authority: ['antiUpdate_cancel'],
                  },
                  {
                    name:'antiUpdate_reStart',
                    authority: ['antiUpdate_reStart'],
                  },
                ]
              },
            ]
          },
          {
            path:'/device/video',
            name: 'video',
            authority: ['video'],
            routes:[
              {
                path:'/device/video/list',
                name: 'videoList',
                authority: ['videoList'],
                hideChildrenInMenu:true,
                routes:[
                  { path: '/device/video/list', redirect: '/device/video/list/table'},
                  {
                    path:'/device/video/list/table',
                    component: './Video/VideoList',
                    authority: ['videoList'],
                  },
                  {
                    path:'/device/video/list/add',
                    component: './Video/form/videoForm',
                    name:'video_add',
                    authority: ['video_add'],
                  },
                  {
                    path:'/device/video/list/record',
                    component: './Video/record/record',
                    name:'video_record',
                    authority: ['video_record'],
                  },
                ]
              },
              {
                path:'/device/video/versions',
                name: 'videoVersion',
                authority: ['videoVersion'],
                hideChildrenInMenu:true,
                routes:[
                  { path: '/device/video/versions', redirect: '/device/video/versions/table'},
                  {
                    path:'/device/video/versions/table',
                    component: './VideoVersion/VideoVersion',
                    authority: ['videoVersion'],
                  },
                  {
                    path:'/device/video/versions/add',
                    component: './VideoVersion/form/videoVersionForm',
                    name:'video_versions_add',
                    authority: ['video_versions_add'],
                  },
                  {
                    name:'video_versions_delete',
                    authority: ['video_versions_delete'],
                  },
                ]
              },
              {
                path:'/device/video/update',
                name: 'videoUpdate',
                hideChildrenInMenu:true,
                component: './VideoUpdate/VideoUpdate',
                authority: ['videoUpdate'],
                routes:[
                  { path: '/device/video/update', redirect: '/device/video/update/publicCompany' },
                  {
                    path:'/device/video/update/publicCompany',
                    component: './PublicCompany/PublicCompany',
                    authority: ['videoUpdate'],
                  },
                  {
                    path:'/device/video/update/crane',
                    component: './VideoUpdate/update/update',
                    authority: ['videoUpdate'],
                  },
                  {
                    path:'/device/video/update/versions',
                    component: './VideoUpdate/versions/updateVersions',
                    name:'videoUpdate_chooseVersion',
                    authority: ['videoUpdate_chooseVersion'],
                  },
                  {
                    name:'videoUpdate_currentVersion',
                    authority: ['videoUpdate_currentVersion'],
                  },
                  {
                    name:'videoUpdate_start',
                    authority: ['videoUpdate_start'],
                  },
                  {
                    name:'videoUpdate_cancel',
                    authority: ['videoUpdate_cancel'],
                  },
                  {
                    name:'videoUpdate_reStart',
                    authority: ['videoUpdate_reStart'],
                  },

                ]
              },
            ]
          }
        ]
      },
      // {
      //   path:'/record',
      //   name: 'record',
      //   icon: 'tag',
      //   authority: ['record'],
      //   routes:[
      //     {
      //       path: '/record/onlineRecord',
      //       name: 'onlineRecord',
      //       authority: ['onlineRecord'],
      //       component: './OnlineRecord/OnlineRecord',
      //     },
      //     {
      //       path: '/record/allAntis',
      //       name: 'allAntis',
      //       authority: ['allAntis'],
      //       component: './AllAntis/AllAntis',
      //     },
      //     {
      //       path: '/record/allVideos',
      //       name: 'allVideos',
      //       authority: ['allVideos'],
      //       component: './AllVideos/AllVideos',
      //     }
      //   ]
      // },
      {
        path:'/foreign',
        name: 'foreign',
        icon: 'tag',
        authority: ['foreign'],
        routes:[
          {
            path: '/foreign/glodon',
            name: 'glodon',
            hideChildrenInMenu: true,
            authority: ['glodon'],
            routes:[
              { path: '/foreign/glodon', redirect: '/foreign/glodon/table'},
              {
                path:'/foreign/glodon/table',
                component: './Glodon/Glodon',
                authority: ['glodon'],
              },
              {
                path:'/foreign/glodon/edit',
                component: './Glodon/form/glodonForm',
                name: 'glodon_edit',
                authority: ['glodon_edit'],
              },
            ]
          },
        ]
      },
      {
        path:'/analyse',
        name: 'analyse',
        icon: 'tag',
        authority: ['analyse'],
        routes:[
          {
            path:'/analyse/online',
            name: 'analyseOnline',
            authority: ['analyseOnline'],
            routes:[
              { path: '/analyse/online', redirect: '/analyse/online/table'},
              {
                path:'/analyse/online/table',
                component: './AnalyseOnline/AnalyseOnline',
                authority: ['analyseOnline'],
              },
            ]
          }
        ]
      },
      {
        path: '/account',
        name: 'setting',
        icon: 'user',
        authority: ['setting'],
        routes: [
          { path: '/account', redirect: '/account/setting' },
          {
            path: '/account/setting',
            component: './Account/SettingLayout',
            authority: ['setting'],
            routes: [
              { path: '/account/setting', redirect: '/account/setting/password' },
              {
                path: '/account/setting/password',
                component: './Account/layout/password',
                authority: ['setting'],
              }
            ],
          },
        ],
      },
      {
        path: '/exception',
        routes: [
          {
            path: '/exception/403',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            component: './Exception/404',
          },
          {
            path: '/exception/500',
            component: './Exception/500',
          }
        ],
      },
      {
        name: 'face',
        hideInMenu:true
      },
      {
        component: '404',
      },
    ],
  },
];
