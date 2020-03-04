/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {Row,Col,Button,Tag,Progress ,message} from 'antd';
import {closeSocket,sendCmd} from "@/utils//websocket";
import CommonTable from '@/components/CommonTable';

@connect(({ videoUpdate,user }) => ({
  videoUpdate,
  auth:user.authorization,
}))
class Update extends Component {
  state = {
    maxHeight:0,
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
    projectRowKey:'projectId',
    craneRowKey:'craneId',
    selectedKeys:[],
    list:[],
    total:0,
  };
  index = 0;
  currentCmd = null;
  currentCode = null;
  timer = null;
  craneColumns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      width:100,
    },
    {
      title: 'SN',
      dataIndex: 'videoSn',
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
      dataIndex: 'currentVersion',
      align:'center',
      width:150,
    },
    {
      title: formatMessage({id:'app.device.upVersion'}),
      dataIndex: 'upgradeVersion',
      align:'center',
      width:150,
    },
    {
      title: formatMessage({id:'app.device.softwareSize'}),
      dataIndex: 'upgradeSize',
      align:'center',
      width:150,
    },
    // {
    //   title: 'MD5',
    //   dataIndex: 'upgradeMd5',
    //   width:300,
    // },
    {
      title: formatMessage({id:'app.device.progress'}),
      dataIndex: 'ratio',
      width:300,
      render: (text, record) => (
        <Fragment>
          <Progress status="active" percent={record.ratio} />
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.device.check-result'}),
      dataIndex: 'checkResult',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <Tag color = {record.checkResult ? (record.checkResult === 255 ? 'orange':'magenta') : 'green'}>{this.resolveError(record.checkResult,record.ratio)}</Tag>
        </Fragment>
      ),
    }
  ];
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.setState({maxHeight:document.getElementById('content').offsetHeight});
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
    let { dispatch,location,videoUpdate } = this.props;
    const {projectId} = this.state.params;
    const {pageNumber = 0, pageSize = 10} = (videoUpdate.pageObj)[projectId] || {};
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params,loading:true});
    dispatch({
      type: 'videoUpdate/getCranes',
      payload:params,
      callback:(data)=>{
        this.setState({loading:false});
        const selected = [];
        const selectKeys = [];
        let isFail = false;
        data.list.forEach((item)=>{
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
            if(!isFail && item.checkResult){
              isFail = true;
            }
          }
        });
        this.setState({selectedRowKeys:selectKeys,selectedRows:selected,reStartState:!isFail});
        this.setState({list:data.list,total:data.total},()=>{
          if(location.state.versionName){
            this.setVersion(location.state);
          }
          if(this.checkBeginRefresh()){
            this.closeTimer();
            this.timeRequest();
          }
        });
      }
    });
  };
  /*检查是否开启更新*/
  checkBeginRefresh = () => {
    const {selectedRows} = this.state;
    return selectedRows.some((item)=>{
      return item.ratio && item.checkResult === 255;
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    const {pageObj} = this.props.videoUpdate;
    const {projectId} = this.state.params;
    pageObj[projectId] = {pageNumber:page - 1,pageSize};
    this.props.dispatch({
      type: 'videoUpdate/setPage',
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
  /*检验重启按钮*/
  resetReStart(keys,list){
    let isFail = false;
    list.forEach((item)=>{
      if(keys.includes(item.craneId)){
        if(!isFail && item.checkResult){
          isFail = true;
        }
      }
    });
    this.setState({reStartState:!isFail});
    return !isFail;
  }
  /*选择版本*/
  chooseVersion = () => {
    const {params} = this.state;
    router.push({
      pathname:'/device/video/update/versions',
      state:{projectId:params.projectId,selectKeys:this.state.selectedRowKeys}
    })
  };
  /*版本赋值给选中项*/
  setVersion = (data) => {
    const {selectedRowKeys,list} = this.state;
    const newList = list.map((item)=>{
      if(selectedRowKeys.includes(item.craneId)){
        item.upgradeMd5 = data.md5;
        item.upgradeSize = data.fileSize;
        if(item.upgradeVersion !== data.versionName){
          item.ratio = 0;
          item.checkResult = 255;
        }
        item.upgradeVersion = data.versionName;
        return item;
      }
      return item;
    });
    const newSelectRows = newList.filter((item)=>{
      return selectedRowKeys.includes(item.craneId)
    });
    this.resetReStart(selectedRowKeys,newList);
    this.setState({list:newList,selectedRows:newSelectRows})
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
              this.switchCmd(res.cmd,res.rwStatus,this.index,0);
            }else{
              this.setState({lookVersionLoading:false});
            }
          }else if(res.rwStatus === 'W'){
            if(this.index < selectedRows.length - 1){
              this.index++;
              this.switchCmd(res.cmd,res.rwStatus,this.index,res.vo.code === undefined ? 0 : res.vo.code);
            }else{
              if(res.cmd === 'VideoConfirmUpgrade'){
                const {list,selectedRowKeys} = this.state;
                list.forEach((item)=>{
                  if(selectedRowKeys.includes(item.craneId)){
                    Object.assign(item,{ratio:0,checkResult:255});
                  }
                });
                this.setState({list:list});
              }else if(res.cmd === 'VideoUpGradeInfo'){
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
  cmdClick(cmd,rw,mark,code){
    // 这么做的目的是在一个命令执行的过程中点击另外一个就停止当前的命令
   this.currentCmd = cmd;
   this.currentCode = code;
   this.switchCmd(cmd,rw,mark,code);
  }
  /*全部操作*/
  switchCmd(cmd,rw,mark,code){
    let {selectedRows} = this.state;
    if(cmd !== this.currentCmd && code === this.currentCode) return;
    if(!mark){
      this.index = 0;
      this.switchLoading(cmd,code);
      this.cmd(cmd,rw,selectedRows[0],code);
      if(rw !== 'R') this.closeTimer();
    }else{
      for(let i = mark; i < selectedRows.length; i++){
        this.cmd(cmd,rw,selectedRows[i],code);
      }
    }
  }
  /*loading*/
  switchLoading = (cmd,code) => {
    switch(cmd){
      case 'VideoUpGradeInfo':
        this.setState({beginLoading:true});
        break;
      case 'VideoConfirmUpgrade':
        if(!code){
          this.setState({cancelLoading:true});
        }else{
          this.setState({reStartLoading:true});
        }
        break;
      case 'VideoSystemVersion':
        this.setState({lookVersionLoading:true});
        break;
    }
  };
  /*下命令*/
  cmd(cmd,rw,item,code){
    if(rw === 'W'){
      let params = {};
      if(cmd === 'VideoUpGradeInfo'){
        if(this.checkChooseVersion()){
          message.error(formatMessage({id:'app.device.choose-version'}));
          return;
        }
        params  ={fileAddress:null,softwareVersion:item.upgradeVersion,softwareSize:item.upgradeSize,md5:item.upgradeMd5,
          username:null,password:null,ip:null,port:null};
        sendCmd({cmd:cmd,vo:params,craneId:item.craneId,rwStatus:rw},this.showData);
      }else if(cmd === 'VideoConfirmUpgrade'){
        params.code = code;
        sendCmd({cmd:cmd,vo:params,craneId:item.craneId,rwStatus:rw},this.showData);
      }
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
  refresh = () => {
    let { dispatch } = this.props;
    const {list,selectedRowKeys} = this.state;
    if(!selectedRowKeys.length){
       this.closeTimer();
       return;
    }
    dispatch({
      type: 'videoUpdate/getRefresh',
      payload:this.state.params,
      callback:(data)=>{
        for(const item of data.list){
          for(const va of list){
            if(item.craneId === va.craneId && selectedRowKeys.includes(item.craneId)){
              Object.assign(va,item);
            }
          }
        }
        const isOk = this.resetReStart(selectedRowKeys,list);
        this.setState({list:list},()=>{
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
  /*处理错误信息*/
  resolveError = (code,ratio) => {
    switch(code){
      case 0:
        return formatMessage({id:'app.device.success'});
        break;
      case 1:
        return formatMessage({id:'app.device.downLoad-fail'});
      case 2:
        return formatMessage({id:'app.device.version-fail'});
        break;
      case 3:
        return formatMessage({id:'app.device.file-fail'});
        break;
      case 255:
        return !ratio ? formatMessage({id:'app.device.wait-up'}) : formatMessage({id:'app.device.up-doing'});
        break;
      default:
        return formatMessage({id:'app.device.fail'});
        break;
    }
  };
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
                {this.props.auth.videoUpdate_currentVersion ? (
                  <Button type="primary"  icon="search" className = 'm-r-10' disabled={!selectedRows.length} loading={lookVersionLoading} onClick={() => this.cmdClick('VideoSystemVersion','R',0,0)}><FormattedMessage id='app.device.currentVersion' /></Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.videoUpdate_chooseVersion ? (
                  <Button type="primary"  icon="plus" className = 'm-r-10' disabled={!selectedRows.length} onClick={this.chooseVersion}><FormattedMessage id='app.device.chooseVersion' /></Button>
                ):(<Fragment></Fragment>)}
              </Col>
              <Col className = 'p-b-10'>
                {this.props.auth.videoUpdate_start ? (
                  <Button type="primary"  icon="play-circle" className = 'm-r-10' disabled={!selectedRows.length} loading={beginLoading} onClick={() => this.cmdClick('VideoUpGradeInfo','W',0,0)}><FormattedMessage id='app.device.allStart' /></Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.videoUpdate_cancel ? (
                  <Button type="primary"  icon="poweroff" className = 'm-r-10' disabled={!selectedRows.length} loading={cancelLoading} onClick={() => this.cmdClick('VideoConfirmUpgrade','W',0,0)}><FormattedMessage id='app.device.allCancel' /></Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.videoUpdate_reStart ? (
                  <Button type="primary"  icon="sync" loading={reStartLoading} disabled={!selectedRows.length || !reStartState} onClick={() => this.cmdClick('VideoConfirmUpgrade','W',0,1)}><FormattedMessage id='app.device.allReStart' /></Button>
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
