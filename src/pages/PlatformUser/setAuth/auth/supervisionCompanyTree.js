/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Card,Row,Col,Tree,Button } from 'antd';
import {transPingTreeToChildren,resMessage,compare } from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
const { TreeNode } = Tree;
@connect(({platformUser,loading }) => ({
  platformUser,
  loading:loading.effects['platformUser/getOrganization'],
}))
class supervisionCompanyTree extends React.Component {
  state={
    userId:null,
    oldData:[],
    treeData:[],
    checkItem:[],
    expandedKeys: [],
    saveLoading:false,
    autoExpandParent: true,
    loading:false
  };
  defaultExpand = [];
  userInfo = {};
  /*DOM加载完成后执行*/
  componentDidMount() {
    const local = this.props.location.state;
    if(local){
      this.userInfo = local;
      this.getList();
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'platformUser/getOrganization',
      callback:(res)=>{
        const newList = res.orgSupervisionListVo.filter((item)=>item.businessLevel < 20).sort(compare('orgId',0));
        const list = transPingTreeToChildren({id:'orgId',pid:'parentId',children:'children'},newList);
        this.resolveRequest(list);
      }
    });
  };
  /*判断请求分类*/
  resolveRequest(list){
    const {userId,parentUserId,loginUserId} = this.userInfo;
    if(parentUserId !== loginUserId){
      const params = {userId:userId,parentUserId:parentUserId,list:list,type:1};
      this.requestParentSelect(params);
    }else{
      this.requestSelect(userId,list);
    }
  }
  /*请求parentUserId已选资源*/
  requestParentSelect(params){
    const { dispatch } = this.props;
    const {userId,parentUserId,list,type} = params;
    const newParams = {businessType:3,userId:type ? parentUserId : userId};
    dispatch({
      type: 'platformUser/getSelectOrganization',
      payload:newParams,
      callback:(res)=>{
        if(type){
          const newList = this.loopOrg(list,res,[]);
          const treeList = this.loop(newList);
          this.setState({
            oldData:newList,
            treeData:treeList,
          },()=>{
            this.setState({expandedKeys:this.defaultExpand});
          });
          this.requestParentSelect({...params,...{type:0}});
        }else{
          this.setState({checkItem:res});
        }
      }
    });
  }
  /*请求userId的已选资源*/
  requestSelect(userId,list){
    const { dispatch } = this.props;
    const params = {businessType:3,userId:userId};
    dispatch({
      type: 'platformUser/getSelectOrganization',
      payload:params,
      callback:(res)=>{
        const treeList = this.loop(list);
        this.setState({
          oldData:list,
          treeData:treeList,
        },()=>{
          this.setState({expandedKeys:this.defaultExpand});
        });
        this.setState({checkItem:res});
      }
    });
  }
  /*递归截取组织树*/
  loopOrg(data,selected,array){
    for(const item of data){
      if(selected.includes(item.orgId)){
        array.push(item);
      }else if(item.children){
        array = this.loopOrg(item.children,selected,array)
      }
    }
    return array;
  }
  /*区别图标*/
  selectIcon = (level) =>{
    switch(level){
      case 1:
        return 'icon-company company1-color';
        break;
      case 2:
        return 'icon-company company2-color';
        break;
      case 3:
        return 'icon-company company3-color';
        break;
      case 4:
        return 'icon-company company4-color';
        break;
      case 5:
        return 'icon-company company5-color';
        break;
      case 19:
        return 'icon-project project-color';
        break;
      case 20:
        return 'icon-crane crane-color';
        break;
      default:
        break;
    }
  }
  /*处理树*/
  loop = (data) => data.map((item) => {
    if(item.orgId){
      this.defaultExpand.push(item.orgId.toString());
      const title = <span>{item.name}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.orgId} title={title} icon={<i className={['iconfont',this.selectIcon(item.businessLevel)].join(' ')}/>}>
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={title} key={item.orgId} icon={<i className={['iconfont',this.selectIcon(item.businessLevel)].join(' ')}/>}/>;
    }
  });
  /*展开*/
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  /*节点被选中*/
  onCheck = (checkedKeys, info) => {
    const {oldData,checkItem} = this.state;
    let currentKey;
    const checked = checkedKeys.checked;
    if(info.checked){
      currentKey = checked[checked.length - 1];
    }else{
      for(const item of checkItem){
        if(!checked.includes(item)){
          currentKey = item;
        }
      }
    }
    const clearUp = this.resolveItemUp(oldData,currentKey);
    const selectDown = this.resolveItemDown(oldData,currentKey,[],false,null);
    const newData = [...clearUp,...selectDown];
    const newSelect = [];
    checked.forEach((item)=>{
      if(!newData.includes(item)){
        newSelect.push(item);
      }
    });
    this.setState({checkItem:newSelect})
  };
  /*递归处理节点向上*/
  resolveItemUp(data,key){
    let array = null;
    for(const item of data){
      if(item.children){
        array = this.resolveItemUp(item.children,key);
        if(!!array){
          array.push(item.orgId.toString());
          return array;
        }
      }
      if(item.orgId === parseInt(key)){
        return [];
      }
    }
  };
  /*递归处理节点向下*/
  resolveItemDown(data,key,array,flag,pid){
    for(const item of data){
      if(!!flag){
        if(item.parentId !== pid){
          array.push(item.orgId.toString());
        }else {
          flag = false;
        }
      }
      if(item.orgId === parseInt(key)){
        flag = true;
        pid = item.parentId;
      }
      if(item.children){
        this.resolveItemDown(item.children,key,array,flag,pid);
      }
    }
    return array;
  }
  /*保存权限*/
  saveAuth = () => {
    this.setState({saveLoading:true});
    const { dispatch } = this.props;
    const {checkItem}  =this.state;
    dispatch({
      type: 'platformUser/saveOrganization',
      payload:{userId:this.userInfo.userId,orgIdSet:checkItem,businessType:3},
      callback:(res)=>{
        resMessage(res);
        this.setState({saveLoading:false});
      }
    });
  };
  render(){
    const {treeData,expandedKeys,autoExpandParent,checkItem,saveLoading} = this.state;
    return (
      <div>
        <Row type="flex" justify="end">
          {!!this.props.location.state ? (
            <Button type="primary" loading={saveLoading} onClick={()=>this.saveAuth()}>
              <FormattedMessage id='app.common.save'/>
            </Button>
          ):(<Fragment></Fragment>)}
        </Row>

        <Tree
          showIcon
          checkable
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          checkedKeys={checkItem}
          onCheck={this.onCheck}
          checkStrictly = {true}
        >
          {treeData}
        </Tree>
      </div>
    );
  }
}

export default supervisionCompanyTree;
