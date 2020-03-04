/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {transPingTreeToChildren,compare,recursionTopToKey,recursionTopToObj} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import {Card,Row,Col } from 'antd';
import CommonCompanyTree from '@/components/CommonCompanyTree';

import $ from "jquery";
@connect(({ peccancy,treeAllSelect }) => ({
  peccancy,
  defaultCompany:treeAllSelect.defaultCompany,
  companySelect:treeAllSelect.companySelect,
}))
class PeccancyLayout extends Component {
  state = {
    oldTreeData:[],
    treeData:[],
    selectedKeys:[],
    defaultExpandedKeys:[],
    options:[],
    companySelect:null
  };
  allCompanyData = {};
  selectKey = null;
  currentData = [];
  checkKey = null;
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getTreeData();
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && !nextState){
      this.getTreeData();
    }
  }
  /*请求树的事件*/
  getTreeData = () => {
    this.props.dispatch({
      type: 'peccancy/getTree',
      callback:(res)=>{
        const {options} = this.state;
        let keys = [];
        if(res.orgWorkListVo.length){
          options.push({value:1,name:formatMessage({id:'app.common.workCompany'})});
          keys.push(1);
        };
        if(res.orgBuildListVo.length){
          options.push({value:2,name:formatMessage({id:'app.common.buildCompany'})});
          keys.push(2);
        };
        if(res.orgSupervisionListVo.length){
          options.push({value:3,name:formatMessage({id:'app.common.supervisionCompany'})});
          keys.push(3);
        };
        this.allCompanyData = res;
        this.setState({options:options});
        const defaultCompany = this.props.defaultCompany;
        const companySelect = defaultCompany ? defaultCompany : keys[0];
        this.changeSelect(companySelect);
      }
    });
  };
  /*模式改变*/
  changeSelect = (value) => {
    this.selectKey = value;
    this.setState({companySelect:value});
    let data = [];
    switch(value){
      case 1:
        data = this.allCompanyData['orgWorkListVo'];
        break;
      case 2:
        data = this.allCompanyData['orgBuildListVo'];
        break;
      case 3:
        data = this.allCompanyData['orgSupervisionListVo'];
        break;
    }
    const newData = JSON.parse(JSON.stringify(data));
    const newList = newData.filter((item)=>item.businessLevel < 20).sort(compare('orgId',0));
    const copyList = JSON.parse(JSON.stringify(newList));
    const list = transPingTreeToChildren({id:'orgId',pid:'parentId',children:'children'},newList);
    const defaultExpandedKeys = this.resolveShow(list);
    this.currentData = list;
    this.setState({
      oldTreeData:copyList,
      treeData:list,
      defaultExpandedKeys:defaultExpandedKeys
    },()=>{
      this.initClickTree(list);
    })
  };
  /*处理默认显示*/
  resolveShow(list){
    let defaultExpandedKeys = [];
    let selectId = null;
    if(list.length){
      const treeDefault = this.props.companySelect[this.selectKey];
      if(treeDefault){
        selectId = treeDefault;
      }else{
        selectId = list[0].orgId;
      }
      defaultExpandedKeys = recursionTopToKey(list,'orgId','orgId',selectId).map((item)=>item.toString());
    }
    return defaultExpandedKeys;
  }
  /*初始点击树*/
  initClickTree = (treeData) => {
    const treeDefault = this.props.companySelect[this.selectKey];
    let selectId = null;
    if(!!treeData.length){
      if(treeDefault){
        selectId = treeDefault.toString();
      }else{
        selectId = treeData[0].orgId.toString();
      }
      this.onSelect([selectId]);
    }
  };
  /*点击查询*/
  onSelect = (selectedKeys,e) => {
    if(!!e && !e.selected){
      selectedKeys = this.checkKey
    }else{
      this.checkKey = selectedKeys;
    }
    this.setState({
      selectedKeys:selectedKeys
    });
    if(!selectedKeys.length) return false;
    const selectData = this.state.oldTreeData.filter((val)=>{
      return parseInt(selectedKeys[0]) === val.orgId;
    });
    if(!selectData.length) return;
    this.props.companySelect[this.selectKey] = selectData[0].orgId;
    $('html,body').animate({scrollTop: 0}, 500);
    router.push({
      pathname:'/statistics/peccancy/peccancyLayout/show',
      state:{id:selectData[0].orgId,businessType:this.selectKey}
    });
    this.props.dispatch({
      type: 'treeAllSelect/modifySelect',
      payload: {defaultCompany:this.selectKey,companySelect:this.props.companySelect}
    });
  };
  /*值更改*/
  onSearchChange = (value) => {
    const {oldTreeData} = this.state;
    let newObj = [],newList = this.currentData,expandKeys = this.state.defaultExpandedKeys;
    if(!!value){
      let newArray = [],obj = [];
      const res = recursionTopToObj(this.currentData,this.currentData,'name','orgId','parentId',value,false,null,[]);
      for(const index of res){
        if(!newArray.includes(index)){
          newArray.push(index);
          obj.push(oldTreeData.filter((item)=>{return item.orgId === index})[0])
        }
      }
      newObj = JSON.parse(JSON.stringify(obj));
      newList = transPingTreeToChildren({id:'orgId',pid:'parentId',children:'children'},newObj);
    }
    expandKeys = this.findIds(newList,[]);
    this.setState({treeData:newList},()=>{this.setState({defaultExpandedKeys:expandKeys})})
  };
  /*找出ids*/
  findIds(data,ids){
    for(const item of data){
      if(item.children){
        ids.push(item.orgId.toString());
        this.findIds(item.children,ids)
      }
    }
    return ids;
  }
  /*展开*/
  onExpand = (expandedKeys) => {
    this.setState({defaultExpandedKeys:expandedKeys});
  };
  render() {
    const {children} = this.props;
    const {treeData,selectedKeys,defaultExpandedKeys,options,companySelect} = this.state;
    return (
      <Card>
        <Row className = ' flex overflow-hidden' >
          <CommonCompanyTree
            onSelect = {this.onSelect}
            data = {treeData}
            selectedKeys = {selectedKeys}
            defaultExpandedKeys = {defaultExpandedKeys}
            changeSelect = {this.changeSelect}
            options = {options}
            companySelect = {companySelect}
            onSearchChange = {this.onSearchChange}
            onExpand = {this.onExpand}

          />
          <Col  className = ' auto-flex' style={{width:'calc(100% - 257px)'}}>
            {children}
          </Col>
        </Row>
      </Card>
    );
  }
}

export default PeccancyLayout;
