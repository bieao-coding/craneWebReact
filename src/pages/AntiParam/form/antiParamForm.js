/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Menu,Row,Col} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import styles from './antiParamForm.less'
import router from 'umi/router';
import {closeSocket} from "@/utils/websocket";

const { Item } = Menu;
const menuMap = {
  craneStructure: formatMessage({id:'app.device.craneStructure'}),
  antiStructure: formatMessage({id:'app.device.antiStructure'}),
  torqueAndWind: formatMessage({id:'app.device.torqueAndWind'}),
  craneAlarmAndWarning: formatMessage({id:'app.device.craneAlarmAndWarning'}),
  devicePassword: formatMessage({id:'app.device.devicePassword'}),
  versionSetting: formatMessage({id:'app.device.versionSetting'}),
  areaWarning: formatMessage({id:'app.device.areaWarning'}),
  windSensor: formatMessage({id:'app.device.windSensor'}),
  //belongProject: "所属工程参数设置",
  masterVersion:formatMessage({id:'app.device.masterVersion'}),
  //serviceStatus:'维护参数设置',
  systemSwitch:formatMessage({id:'app.device.systemSwitch'}),
  deviceLocked:formatMessage({id:'app.device.lockedDevice'}),
  // angularLimit:formatMessage({id:'app.device.angularLimit'}),
  craneUp:formatMessage({id:'app.device.craneUp'}),
  byPass:'ByPass',
  fall:formatMessage({id:'app.device.fall'}),
  craneArea:formatMessage({id:'app.device.craneArea'}),
  towerGroup:formatMessage({id:'app.device.towerGroup'}),

};
@connect(({}) => ({
}))
@Form.create()
class AntiParamForm extends Component {
  state = {
    mode: 'inline',
    title:'',
    list:[],
    menuMap,
    currentIndex:0,
    selectKey: 'craneStructure',
  };
  // DOM加载完成后执行
  componentDidMount() {
    sessionStorage.setItem('towerGroup',JSON.stringify([]));
    const params = this.props.location.state;
    if(params && params.id){
      this.setState({id:params.id,title:params.title,list:params.list},()=>{
        this.getCurrentIdIndex();
      });
    };
  }
  /*获取当前id的位置*/
  getCurrentIdIndex(){
    const {list = [],id} = this.state;
    let currentIndex = null;
    list.forEach((item,index)=>{
      if(item.craneId === id){
        currentIndex = index;
      }
    })
    this.setState({currentIndex})
  }
  selectKey = ({ key }) => {
    router.push({
      pathname:`/device/anti/param/layout/crane/set/${key}`,
      state:{id:this.state.id}
    });
    this.setState({
      selectKey: key,
    });
  };
  getmenu = () => {
    const { menuMap } = this.state;
    return Object.keys(menuMap).map(item => <Item key={item}>{menuMap[item]}</Item>);
  };
  preNextDevice = (type) => {
    const {list,id,title} = this.state;
    let orgIndex = '',orgTitle = '',newId = '',newIndex = '';
    const len = list.length;
    list.forEach((item,index)=>{
      if(item.craneId === id){
        orgIndex = index;
      }
    })
    if(type){
      if(orgIndex + 1 < len){
        newIndex = orgIndex + 1;
        const nextList = list[orgIndex + 1];
        orgTitle = title.substr(0,title.lastIndexOf('>')) + `> ${nextList.craneNumber}`;
        newId = nextList.craneId;
      }

    }else{
      if(orgIndex - 1 >= 0){
        newIndex = orgIndex - 1;
        const preList = list[orgIndex - 1];
        orgTitle = title.substr(0,title.lastIndexOf('>')) + `> ${preList.craneNumber}`;
        newId = preList.craneId;
      }
    }
    this.setState({title:orgTitle,id:newId,currentIndex:newIndex},()=>{
      const pathname = this.props.location.pathname;
      const currentPage = pathname.substr(pathname.lastIndexOf('/') + 1);
      this.selectKey({key:currentPage})
    })
  }
  /*卸载*/
  componentWillUnmount(){
    closeSocket();
    sessionStorage.removeItem('towerGroup');
  }
  /*渲染*/
  render() {
    const { children } = this.props;
    const { mode, selectKey,title,currentIndex,list = []} = this.state;
    return (
      <div>
        <Row className='title flex'>
          <span className='m-r-10'>{title}</span>
          <Button type="primary" className='m-r-10' disabled={currentIndex - 1 < 0} onClick= {()=>this.preNextDevice()} ><FormattedMessage id='app.device.beforeDevice'/></Button>
          <Button type="primary" disabled={currentIndex + 1 >= list.length} onClick= {()=>this.preNextDevice(1)}><FormattedMessage id='app.device.afterDevice'/></Button>
        </Row>
        <Row style={{height:'calc(100% - 38px)'}} type='flex'>
          <Col style={{flex:'0 0 270px'}}>
            <Menu mode={mode} selectedKeys={[selectKey]} onClick={this.selectKey}>
              {this.getmenu()}
            </Menu>
          </Col>
          <Col style={{width:'calc(100% - 270px)'}} className = ' p-l-10 p-r-10'>
            {children}
          </Col>
        </Row>
      </div>
    )
  }
};
export default AntiParamForm;
