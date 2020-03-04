/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {Row,Col,Button,Tag,Progress ,message} from 'antd';
import {closeSocket,sendCmd} from "@/utils//websocket";
import CommonTable from '@/components/CommonTable';

@connect(({ antiUpdate,user }) => ({
  antiUpdate,
  auth:user.authorization,
}))
class Update extends Component {
  state = {
    beginLoading:false,
    cancelLoading:false,
    reStartLoading:false,
    reStartState:0,
    lookVersionLoading:false,
    oldTreeData:[],
    treeData:[],
    selectedRowKeys:[],
    selectedRows:[],
    params:{
      projectId:null,
      pageNumber:0,
      pageSize:10,
    },
    loading:false,
    craneRowKey:'craneId',
    selectedKeys:[],
    list:[],
    total:0
  };
  index = 0;
  currentCmd = null;
  timer = null;
  craneColumns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      width:100,
    },
    {
      title: 'SN',
      dataIndex: 'sn',
      width:150,
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'online',
      align:'center',
      width:100,
      render(val,record) {
        return <i className = {record.online ? 'iconfont icon-signal online-color':'iconfont icon-signal offline-color'}/>;
      },
    },
    {
      title: formatMessage({id:'app.device.currentVersion'}),
      align:'center',
      dataIndex: 'currentVersion',
      width:150,
    },
    {
      title: formatMessage({id:'app.device.upVersion'}),
      align:'center',
      dataIndex: 'upgradeVersion',
      width:150,
    },
    // {
    //   title: '扩展版本',
    //   dataIndex: 'upgradeVersionExp',
    //   width:100,
    // },
    // {
    //   title: 'CRC校验',
    //   dataIndex: 'upgradeCrc',
    //   width:100,
    // },
    {
      title: formatMessage({id:'app.device.softwareSize'}),
      dataIndex: 'upgradeSize',
      align:'center',
      width:150,
    },
    // {
    //   title: '分包大小',
    //   dataIndex: 'packageSize',
    //   align:'center',
    //   width:100,
    // },
    // {
    //   title: '分包数量',
    //   dataIndex: 'packageCount',
    //   align:'center',
    //   width:100,
    // },
    {
      title: formatMessage({id:'app.device.progress'}),
      dataIndex: 'achPackageCount',
      width:300,
      render: (text, record) => (
        <Fragment>
          <Progress status="active" percent={Math.floor((record.achPackageCount/record.packageCount) * 100) } />
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.device.check-result'}),
      dataIndex: 'checkResult', /*0 失败 1 待升级 2 升级中 3 成功*/
      align:'center',
      width:100,
      render: (text, record) => {
        const result = this.showError(record.checkResult);
        const obj = {
          children:
            <Fragment>
              <Tag color={result.showColor}>
                {result.showText}
              </Tag>
            </Fragment>,
          props: {},
        };
        return obj;
      },
    }
  ];
  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({params:{...this.state.params,...{projectId:location.projectId}}},()=>{
        this.getList();
      });
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.projectId !== currentState.projectId){
      this.setState({params:{projectId:nextState.projectId, pageNumber:0, pageSize:10}},()=>{
        this.getList();
      })
    }
  }
  /*请求工程/塔机事件*/
  getList = () => {
    let { dispatch,location,antiUpdate } = this.props;
    const {projectId} = this.state.params;
    const {pageNumber = 0, pageSize = 10} = (antiUpdate.pageObj)[projectId] || {};
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params,loading:true});
    dispatch({
      type: 'antiUpdate/getCranes',
      payload:params,
      callback:(data)=>{
        this.setState({loading:false});
        const selected = [];
        const selectKeys = [];
        let isFail = false;
        const newList = this.sureResultState(data.list);
        newList.forEach((item)=>{
          if(item.online){
            if(location.state.selectKeys){
              if(location.state.selectKeys.includes(item.craneId)){
                selectKeys.push(item.craneId);
                selected.push(item);
              }
            }else{
              selectKeys.push(item.craneId);
              selected.push(item);
            }
            if(!isFail && item.checkResult !== 3){
              isFail = true;
            }
          }
        });
        this.setState({selectedRowKeys:selectKeys,selectedRows:selected,list:newList,total:data.total,reStartState:!isFail},()=>{
          if(location.state.softwareId){
            this.setVersion(location.state);
          }else{
            if(this.checkBeginRefresh()){
              this.closeTimer();
              this.timeRequest();
            }
          }
        });
      }
    });
  };
  /*检查是否开启更新*/
  checkBeginRefresh = () => {
    const {selectedRows} = this.state;
    return selectedRows.some((item)=>{
      return item.checkResult === 2;
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    const {pageObj} = this.props.antiUpdate;
    const {projectId} = this.state.params;
    pageObj[projectId] = {pageNumber:page - 1,pageSize};
    this.props.dispatch({
      type: 'antiUpdate/setPage',
      payload:{pageObj}
    });
    this.setState({
      params:obj
    },()=>{
      this.getList();
    });
  };
  /*选择变化*/
  changeSelect = (selectedRowKeys, selectedRows) => {
    this.resetReStart(selectedRowKeys,this.state.list);
    this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  };
  /*选择版本*/
  chooseVersion = () => {
    router.push({
      pathname:'/device/anti/update/versions',
      state:{projectId:this.state.params.projectId,selectKeys:this.state.selectedRowKeys}
    })
  };
  /*版本赋值给选中项*/
  setVersion = (data) => {
    const {selectedRowKeys,list} = this.state;
    const newList = list.map((item)=>{
      if(selectedRowKeys.includes(item.craneId)){
        item.upgradeVersionExp = data.softwareVersionEx;
        item.upgradeCrc = data.crc;
        item.upgradeSize = data.softwareSize;
        item.packageCount = !(item.upgradeSize%item.packageSize) ? (item.upgradeSize/item.packageSize) : (Math.ceil(item.upgradeSize/item.packageSize));
        if(item.upgradeVersion !== data.softwareVersion){
          item.achPackageCount = 0;
          item.checkResult = 1;
        }
        item.upgradeVersion = data.softwareVersion;
        return item;
      }
      return item;
    });
    const newSelectRows = newList.filter((item)=>{
      return selectedRowKeys.includes(item.craneId)
    });
    this.resetReStart(selectedRowKeys,newList);
    this.setState({list:newList,selectedRows:newSelectRows});
  };

  /*接受返回值*/
  showData = (data) => {
    if(JSON.parse(data)){
      const res = JSON.parse(data);
      console.log(res);
      if(res.status === 'Success' && !!res.vo){
        if(!!res.rwStatus){
          let {selectedRows} = this.state;
          if(res.rwStatus === 'R'){
            this.updateVersion(res.vo);
            if(this.index < selectedRows.length - 1){
              this.index++;
              this.switchCmd(res.cmd,res.rwStatus,this.index);
            }else{
              this.setState({lookVersionLoading:false});
            }
          }else if(res.rwStatus === 'W'){
            if(this.index < selectedRows.length - 1){
              this.index++;
              this.switchCmd(res.cmd,res.rwStatus,this.index);
            }else{
              if(res.cmd === 'ConfirmUpgrade' || res.cmd === 'CancelUpgrade'){
                const {list,selectedRowKeys} = this.state;
                list.forEach((item)=>{
                  if(selectedRowKeys.includes(item.craneId)){
                    Object.assign(item,{achPackageCount:0,checkResult:1});
                  }
                });
                this.setState({list:list});
              }
              if(res.cmd === 'NewSoftwareInfo'){
                this.refresh();
                this.timeRequest();
              }
              this.setState({beginLoading:false,cancelLoading:false,reStartLoading:false});
            }
          }
        }
      }else{
        message.error(res.message);
        this.closeTimer();
        this.setState({beginLoading:false,cancelLoading:false,reStartLoading:false,lookVersionLoading:false});
      }
    }
  };

  cmdClick(cmd,rw,mark){
    // 这么做的目的是在一个命令执行的过程中点击另外一个就停止当前的命令
    this.currentCmd = cmd;
    this.switchCmd(cmd,rw,mark);
  }

  /*全部操作*/
  switchCmd(cmd,rw,mark){
    let {selectedRows} = this.state;
    if(cmd !== this.currentCmd) return;
    if(!mark){
      this.index = 0;
      this.switchLoading(cmd);
      this.cmd(cmd,rw,selectedRows[0]);
      if(rw !== 'R') this.closeTimer();
    }else{
      for(let i = mark; i < selectedRows.length; i++){
        this.cmd(cmd,rw,selectedRows[i]);
      }
    }
  }
  /*loading*/
  switchLoading = (cmd) => {
    switch(cmd){
      case 'NewSoftwareInfo':
        this.setState({beginLoading:true});
        break;
      case 'CancelUpgrade':
        this.setState({cancelLoading:true});
        break;
      case 'ConfirmUpgrade':
        this.setState({reStartLoading:true});
        break;
      case 'SystemInfo':
        this.setState({lookVersionLoading:true});
        break;
    }
  };
  /*下命令*/
  cmd(cmd,rw,item){
    if(rw === 'W'){
      let params = {};
      if(cmd === 'NewSoftwareInfo'){
        if(this.checkChooseVersion()){
          message.error(formatMessage({id:'app.device.choose-version'}));
          return;
        }
        params  ={softwareVersion:item.upgradeVersion,softwareVersionEx:item.upgradeVersionExp,softwareSize:item.upgradeSize,crc:item.upgradeCrc,
          packSize:item.packageSize,packCount:item.packageCount,currentNum:0,checkOk:0};
      }
      sendCmd({cmd:cmd,vo:params,craneId:item.craneId,rwStatus:rw},this.showData);
    }else if(rw === 'R'){
      sendCmd({cmd:cmd,craneId:item.craneId,rwStatus:rw},this.showData);
    }
  }
  /*检查版本选择*/
  checkChooseVersion = () => {
    const {selectedRows} = this.state;
    return selectedRows.some((item)=>{
      return !item.upgradeVersion
    });
  };
  /*5秒请求一次*/
  timeRequest = () => {
    const timer = setInterval(()=>{this.refresh()},5000);
    this.timer = timer;
  };
  /*刷新专用*/
  refresh = () => {
    let { dispatch } = this.props;
    const {list,selectedRowKeys} = this.state;
    if(!selectedRowKeys.length){
       this.closeTimer();
       return;
    }
    dispatch({
      type: 'antiUpdate/getRefresh',
      payload:this.state.params,
      callback:(data)=>{
        for(const item of data.list){
          for(const va of list){
            if(item.craneId === va.craneId && selectedRowKeys.includes(item.craneId)){
              Object.assign(va,item);
            }
          }
        }
        const newList = this.sureResultState(list);
        const isOk = this.resetReStart(selectedRowKeys,newList);
        this.setState({list:newList},()=>{
          if(isOk){
            this.closeTimer();
          }
        });
      }
    });
  };
  /*更新版本*/
  updateVersion = (version) => {
    const {list} = this.state;
    const newList = list.map((item)=>{
      if(item.craneId === version.craneId){
        item.currentVersion = version.softwareVersion;
      }
      return item;
    });
    this.setState({list:newList});
  };
  /*关闭定时*/
  closeTimer = () => {
    if(this.timer){
      clearInterval(this.timer);
    }
  };
  /*显示错误*/
  showError = (result) =>{
    let showColor = '';
    let showText = '';
    switch(result){
      case 1:
        showColor = 'orange';
        showText = formatMessage({id:'app.device.wait-up'});
        break;
      case 2:
        showColor = 'blue';
        showText = formatMessage({id:'app.device.up-doing'});
        break;
      case 3:
        showColor = 'green';
        showText = formatMessage({id:'app.device.success'});
        break;
      default:
        showColor = 'red';
        showText = formatMessage({id:'app.device.fail'});
        break;
    }
    return {showColor:showColor,showText:showText};
  };
  /*判定result的状态*/
  sureResultState(list){
    const newList = list.map((item)=>{
      let center = item;
      if(typeof item.checkResult === 'boolean'){
        if(!item.online || !item.achPackageCount){
        center = {...item,...{checkResult:1,achPackageCount:0}}
        };
        if(item.online){
          if(item.achPackageCount && !item.checkResult){
            center = {...item,...{checkResult:2}}
          }
          if(item.checkResult){
            center = {...item,...{checkResult:3}}
          }
        }
      }
      return center;
    });
    return newList;
  };
  /*检验重启按钮*/
  resetReStart(keys,list){
    let isFail = false;
    list.forEach((item)=>{
      if(keys.includes(item.craneId)){
        if(!isFail && item.checkResult !== 3){
          isFail = true;
        }
      }
    });
    this.setState({reStartState:!isFail});
    return !isFail;
  }
  /*卸载*/
  componentWillUnmount(){
    closeSocket();
    this.closeTimer();
  }
  render() {
    const {list,total,loading,craneRowKey,params,lookVersionLoading,
      selectedRowKeys,beginLoading,cancelLoading,reStartLoading,selectedRows,reStartState} = this.state;
    const rowSelection = {
      selectedRowKeys:selectedRowKeys,
      onChange: this.changeSelect,
      getCheckboxProps: record => ({
        disabled: record.online === false, // Column configuration not to be checked
      }),
    };
    return (
      <div className='p-l-10' id='content'>
        <Row>
          <Col>
            <Row type = 'flex' justify = 'space-between' align = 'middle'>
              <Col className = 'p-b-10'>
                {this.props.auth.antiUpdate_currentVersion ? (
                  <Button type="primary" icon="search"  className = 'm-r-10' disabled={!selectedRows.length} loading={lookVersionLoading} onClick={() => this.cmdClick('SystemInfo','R',0)}><FormattedMessage id='app.device.currentVersion' /></Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.antiUpdate_chooseVersion ? (
                  <Button type="primary" icon="plus"  className = 'm-r-10' disabled={!selectedRows.length} onClick={this.chooseVersion}><FormattedMessage id='app.device.chooseVersion' /></Button>
                ):(<Fragment></Fragment>)}
              </Col>
              <Col className = 'p-b-10'>
                {this.props.auth.antiUpdate_start ? (
                  <Button type="primary" icon="play-circle"  className = 'm-r-10' disabled={!selectedRows.length} loading={beginLoading} onClick={() => this.cmdClick('NewSoftwareInfo','W',0)}><FormattedMessage id='app.device.allStart' /></Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.antiUpdate_cancel ? (
                  <Button type="primary" icon="poweroff"  className = 'm-r-10' disabled={!selectedRows.length} loading={cancelLoading} onClick={() => this.cmdClick('CancelUpgrade','W',0)}><FormattedMessage id='app.device.allCancel' /></Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.antiUpdate_reStart ? (
                  <Button type="primary" icon="sync"  loading={reStartLoading} disabled={!selectedRows.length || !reStartState} onClick={() => this.cmdClick('ConfirmUpgrade','W',0)}><FormattedMessage id='app.device.allReStart' /></Button>
                ):(<Fragment></Fragment>)}
              </Col>
            </Row>
            <CommonTable
              loading={loading}
              list = {list}
              rowKey = {craneRowKey}
              columns = {this.craneColumns}
              total = {total}
              currentPage = {params.pageNumber + 1}
              pageSize = {params.pageSize}
              onChange = {this.onPageChange}
              rowSelection={rowSelection}
              scroll={{ x: 1200}}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Update;
