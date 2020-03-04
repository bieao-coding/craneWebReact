/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Button,message,Table,Tag,Row,Col,Divider,Popconfirm  } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {compare} from '@/utils/utils'
import {closeSocket,sendCmd} from "@/utils//websocket";
import router from "umi/router";
import styles from './towerGroup.less'
@connect(({}) => ({
}))
class TowerGroup extends Component {
  state = {
    readLoading:false,
    writeLoading:false,
    text:'',
    state:0,
    time:'',
    currentRowKey:'craneNum',
    towerRowKey:'craneNumber',
    currentCrane:[],
    towerGroup:[]
  };
  /*列名*/
  currentColumns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNum',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.x'}),
      dataIndex: 'x',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.y'}),
      dataIndex: 'y',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.craneType'}),
      dataIndex: 'craneType',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color = {!record.craneType ? 'blue' : record.craneType === 1 ? 'cyan' : 'green'}>{!record.craneType ? formatMessage({id:'app.common.flat-crane'}) : record.craneType === 1 ? formatMessage({id:'app.common.movable-crane'}) : formatMessage({id:'app.common.head-crane'})}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.device.length1'}),
      dataIndex: 'length1',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.length2'}),
      dataIndex: 'length2',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height1'}),
      dataIndex: 'height1',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height2'}),
      dataIndex: 'height2',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.width1'}),
      dataIndex: 'width1',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.width2'}),
      dataIndex: 'width2',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.length3'}),
      dataIndex: 'length3',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height4'}),
      dataIndex: 'height4',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height3'}),
      dataIndex: 'height3',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachLength4'}),
      dataIndex: 'attachLength4',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height5'}),
      dataIndex: 'height5',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.defaultAngleNum'}),
      dataIndex: 'defaultAngleNum',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachDefaultRadius'}),
      dataIndex: 'attachDefaultRadius',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachHeight6'}),
      dataIndex: 'attachHeight6',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachLength1_1'}),
      dataIndex: 'attachLength1_1',
      align:'center'
    }
  ];
  /*列名*/
  towerColumns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.x'}),
      dataIndex: 'x',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.y'}),
      dataIndex: 'y',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.craneType'}),
      dataIndex: 'craneType',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color = {!record.craneType ? 'blue' : record.craneType === 1 ? 'cyan' : 'green'}>{!record.craneType ? formatMessage({id:'app.common.flat-crane'}) : record.craneType === 1 ? formatMessage({id:'app.common.movable-crane'}) : formatMessage({id:'app.common.head-crane'})}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.device.length1'}),
      dataIndex: 'l1',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.length2'}),
      dataIndex: 'l2',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height1'}),
      dataIndex: 'h1',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height2'}),
      dataIndex: 'h2',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.width1'}),
      dataIndex: 'k1',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.width2'}),
      dataIndex: 'k2',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.length3'}),
      dataIndex: 'l3',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height4'}),
      dataIndex: 'h4',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height3'}),
      dataIndex: 'h3',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachLength4'}),
      dataIndex: 'l4',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.height5'}),
      dataIndex: 'h5',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.defaultAngleNum'}),
      dataIndex: 'defaultAngle',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachDefaultRadius'}),
      dataIndex: 'defaultRadius',
      align:'center'
    },
    {
      title: formatMessage({id:'app.device.attachHeight6'}),
      dataIndex: 'h6',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          <a href = 'javascript:void(0)' onClick={() => this.editCrane(record)}>
            <FormattedMessage id='app.common.edit' />
          </a>
          <Divider type="vertical" />
          <Popconfirm title={formatMessage({id:"app.common.delete-sure"})} onConfirm={() => this.deleteCrane(record)} okText={formatMessage({id:'app.common.sure'})} cancelText={formatMessage({id:'app.common.cancel'})}>
            <a href = 'javascript:void(0)'>
              <FormattedMessage id='app.common.delete' />
            </a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];
  // DOM加载完成后执行
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id},()=>{
        sendCmd({cmd:'CraneStructureExt',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
      });
    }
  }
   /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.id !== currentState.id){
      this.setState({id:nextState.id},()=>{
         sendCmd({cmd:'CraneStructureExt',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData)
      })
    }
  }
  /*接受返回值*/
  showData = (data) => {
    if(JSON.parse(data)){
      const res = JSON.parse(data);
      console.log(res);
      if(res.status === 'Success' && !!res.vo){
        if(res.rwStatus !== 'L'){
          if(res.rwStatus === 'R'){
            if(res.vo.readStatus === 'Success'){
              this.setState({text:formatMessage({id:'app.device.read'}),state:1,time:res.vo.readTime});
              message.success(formatMessage({id:'app.device.read-success'}));
              if(!!res.vo.list){//塔群的
                this.setState({towerGroup:this.resolveData(res.vo.list)});
              }
            }else{
              this.setState({text:formatMessage({id:'app.device.read'}),state:0,time:''});
              message.error(formatMessage({id:'app.device.read-fail'}));
            }
          }else if(res.rwStatus === 'W'){
            if(res.vo.writeStatus === 'Success'){
              this.setState({text:formatMessage({id:'app.device.set'}),state:1,time:res.vo.writeTime});
              message.success(formatMessage({id:'app.device.set-success'}));
              if(!!res.vo.list){//塔群的
                this.setState({towerGroup:res.vo.list});
              }
            }else{
              this.setState({text:formatMessage({id:'app.device.set'}),state:0,time:''});
              message.error(formatMessage({id:'app.device.set-fail'}));
            }
          }
          this.setState({readLoading:false,writeLoading:false});
        }else{
          this.setState({text:'',state:0,time:''});
          if(!!res.vo.list){//塔群的
            const group = !!sessionStorage.getItem('towerGroup') ? JSON.parse(sessionStorage.getItem('towerGroup')) : [];
            if(!group.length){
              this.setState({towerGroup:res.vo.list});
              sessionStorage.setItem('towerGroup',JSON.stringify(res.vo.list));
            }else{
              this.setState({towerGroup:group});
            }
          }else{
            this.setState({currentCrane:[res.vo]});
            sendCmd({cmd:'TowerGroupExt',"vo":{},craneId:this.state.id,rwStatus:'L'},this.showData);
          }
        }
      }else{
        message.error(res.message);
        this.setState({text:'',state:0,time:'',readLoading:false,writeLoading:false});
      }
    }
  };
  /*合并+排序*/
  resolveData = (data) => {
    const oldObj = {};
    const newObjArray = [];
    let {towerGroup} = this.state;
    for(const item of towerGroup){
      const num = parseInt(item.craneNumber);
      oldObj[num] = item;
    };
    data.forEach((value)=>{
      oldObj[value.craneNumber] = value;
    });
    towerGroup = Object.values(oldObj).sort(compare('craneNumber'));
    sessionStorage.setItem('towerGroup',JSON.stringify(towerGroup));
    return towerGroup;
  };
  /*编辑*/
  editCurrentCrane = () => {
    router.push({
      pathname:`/device/anti/param/layout/crane/set/craneStructure`,
      state:{id:this.state.id}
    });
  };
  /*读取参数*/
  readParams = () => {
    this.setState({readLoading:true});
    sendCmd({cmd:'TowerGroupExt',craneId:this.state.id,rwStatus:'R'},this.showData);
  };
  /*获取所有的编号*/
  collectAllNum = () => {
    const usedNum = [];
    this.state.currentCrane.forEach((item) => {usedNum.push(item.craneNum.toString())});
    this.state.towerGroup.forEach((item) => {usedNum.push(item.craneNumber.toString())});
    return usedNum;
  };
  /*添加塔机*/
  addCrane = () => {
    router.push({
      pathname:`/device/anti/param/layout/crane/set/towerGroupForm`,
      state:{id:this.state.id,usedNum:this.collectAllNum()}
    });
  };
  /*编辑塔机*/
  editCrane = (record) => {
    router.push({
      pathname:`/device/anti/param/layout/crane/set/towerGroupForm`,
      state:{...record,...{id:this.state.id}}
    });
  };
  /*删除临时数据*/
  deleteCrane = (record) => {
    let {towerGroup} = this.state;
    let group = JSON.parse(sessionStorage.getItem('towerGroup'));
    towerGroup = towerGroup.filter((item)=>{
      return item.craneNumber !== record.craneNumber;
    });
    this.setState({
      towerGroup:towerGroup
    });
    group = group.filter((item)=>{
      return item.craneNumber !== record.craneNumber;
    });
    sessionStorage.setItem('towerGroup',JSON.stringify(group));
  };
  /*设置数据*/
  saveParams = () => {
    this.setState({writeLoading:true});
    const {towerGroup} = this.state;
    for(const item of towerGroup){
      delete item.initStatus;
      delete item.craneId;
      delete item.id;
    }
    sendCmd({cmd:'TowerGroupExt',vo:towerGroup,craneId:this.state.id,rwStatus:'W'},this.showData);
  };
  /*渲染*/
  render() {
    const {currentRowKey,towerRowKey,currentCrane,towerGroup,text,state,time,readLoading,writeLoading} = this.state;
    return (
      <div>
        <Row className={styles.title}><FormattedMessage id='app.device.device-params' /></Row>
        <Table
          size = 'middle'
          rowKey = {currentRowKey}
          pagination = {false}
          dataSource={currentCrane}
          columns={this.currentColumns}
          scroll={{ x: 2900 }}
        />
        <Row>
          <Button type="primary" icon="edit" className = 'm-t-10 m-b-20' onClick={this.editCurrentCrane} ><FormattedMessage id='app.device.edit-crane' /></Button>
        </Row>
        <Row>
          <Row className={styles.title}><FormattedMessage id='app.device.abort-crane' /></Row>
          <Row>
            <Table
              size = 'middle'
              rowKey = {towerRowKey}
              pagination = {false}
              dataSource={towerGroup}
              columns={this.towerColumns}
              scroll={{ x: 2900 }}
            />
          </Row>
        </Row>
        <Row type='flex' align = 'middle'>
          <Col className='p-b-10'>
            <Button type="primary" icon="search" className = 'm-r-10 m-t-10'  onClick={this.readParams} loading = {readLoading} ><FormattedMessage id='app.device.read-params'/></Button>
            <Button type="primary" icon="plus" className = 'm-r-10 m-t-10' onClick={this.addCrane} disabled={towerGroup.length>=10}><FormattedMessage id='app.device.add-crane'/></Button>
            <Button type="primary" icon="save" className = 'm-r-10 m-t-10' onClick={this.saveParams} loading = {writeLoading}><FormattedMessage id='app.device.set-params'/></Button>
          </Col>
          <Col xl={10} md={24} className={['title-style',!!text ? 'show':'hide'].join(' ')}>
            <Row type="flex" align = 'middle'>
              <span className='m-r-10'>
                <span>{text}<FormattedMessage id='app.device.status'/>：</span>
                <span className={ state ? 'success-color' : 'default-color'}>{state ? formatMessage({id:"app.device.success"}) : formatMessage({id:"app.device.fail"})}</span>
              </span>
              <span className={state ? 'show':'hide'}>
                <span>{text}<FormattedMessage id='app.device.time'/>：</span>
                <span className={ state ? 'success-color' : 'default-color'}>{state ? time : ''}</span>
              </span>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
};
export default TowerGroup;
