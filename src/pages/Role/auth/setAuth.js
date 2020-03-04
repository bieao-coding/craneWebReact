/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Card,Row,Col,Tree,Button } from 'antd';
import allRoutes from "../../../../config/router.config";
import { formatMessage, FormattedMessage } from 'umi/locale';

const { TreeNode } = Tree;
@connect(({ role, loading }) => ({
  role,
  loading: loading.effects['role/fetch'],
}))
class SetAuth extends React.Component {
  state = {
    loading:false,
    routerTree:[],
    checkItem:[],
    roleId:null,
    expandedKeys: [],
    autoExpandParent: true,
  };
  defaultExpand = [];
  itemRoutes = [];
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.resolveAllRouters();
    const local = this.props.location.state;
    if(local && local.roleId){
      this.setState({roleId:local.roleId},()=>{
        this.getList();
      });
    }
  }
  /*处理全部路由*/
  resolveAllRouters(){
    if(allRoutes){
      allRoutes.forEach((item)=>{
        if(item.path === '/'){
          const oldRoute = JSON.parse(JSON.stringify(item.routes));
          this.itemRoutes = this.resolveData(oldRoute,'',null);
          const routerTree = this.loop(this.itemRoutes);
          this.setState({routerTree:routerTree},()=>{
            this.setState({expandedKeys:this.defaultExpand})
          })
        }
      })
    }
  };
  /*处理数据*/
  resolveData(data,path,pid){
    const newData = data.filter((item) => {
      if(item.name){
        item.localName =  path ? (path + `.${item.name}`) : ('menu.' + item.name);
        item.pid = pid;
        if (item.routes) {
          item.routes = this.resolveData(item.routes,item.localName,item.name);
        }
        return item;
      }
    });
    return newData;
  }
  /*处理树*/
  loop = (data) => data.map((item) => {
    if(item.name){
      this.defaultExpand.push(item.name);
      const title = <span>{formatMessage({ id: item.localName })}</span>;
      if (item.routes) {
        return (
          <TreeNode key={item.name} title={title}>
            {this.loop(item.routes)}
          </TreeNode>
        );
      }
      return <TreeNode title={title} key={item.name}/>;
    }
  });
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/getAuth',
      payload:this.state.roleId,
      callback:(res)=>{
        let selectItem = [];
        if(res.length > 0){
          selectItem = res.map((item)=>{
            return item.routeKey
          });
        }

        this.setState({checkItem:selectItem});
      }
    });
  };
  saveAuth = () => {
    const { dispatch } = this.props;
    let {roleId,checkItem} = this.state;
    this.setState({loading:true});
    dispatch({
      type: 'role/saveAuth',
      payload:{roleId:roleId,checkItem:checkItem},
      callback:(res)=>{
        if(res && res.status === 'Success'){
          this.setState({loading:false});
          this.props.history.go(-1);
        }
      }
    });
  };
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  /*树的勾选事件*/
  onCheck = (checkedKeys,e) => {
    const keys = checkedKeys.checked;
    const upNames = this.resolveItemUp(this.itemRoutes,e.node.props.eventKey);
    const downNames = this.resolveItemDown(this.itemRoutes,e.node.props.eventKey,[],false,null);
    let newArray = [];
    if(e.checked){
      newArray = [...keys,...upNames,...downNames];

    }else{
      newArray = keys.filter((item)=>!downNames.some((down)=>down === item))
    }
    const obj = {};
    newArray.filter((item)=>{
      if(!obj[item]){
        obj[item] = true;
      }
    });
    this.setState({checkItem:Object.keys(obj)});
  };
  /*递归处理节点向上*/
  resolveItemUp(data,key){
    let array = null;
    for(const item of data){
      if(item.routes){
        array = this.resolveItemUp(item.routes,key);
        if(!!array){
          array.push(item.name.toString());
          return array;
        }
      }
      if(item.name === key){
        return [];
      }
    }
  };
  /*递归处理节点向下*/
  resolveItemDown(data,key,array,flag,pid){
    for(const item of data){
      if(!!flag){
        if(item.pid !== pid){
          array.push(item.name);
        }else {
          flag = false;
        }
      }
      if(item.name === key){
        flag = true;
        pid = item.pid;
      }
      if(item.routes){
        this.resolveItemDown(item.routes,key,array,flag,pid);
      }
    }
    return array;
  }
  render() {
    const {routerTree,checkItem,loading,expandedKeys,autoExpandParent} = this.state;
    return (
      <Card>
      <Row type="flex" justify="space-between">
        <span className='title'><FormattedMessage id='app.role.pageAuth'/></span>
        <Button type="primary" loading={loading} icon="save" onClick={()=>this.saveAuth()}>
          <FormattedMessage id='app.common.save'/>
        </Button>
      </Row>
       <Row>
         <Col>
           <Tree
             checkable
             checkStrictly
             onExpand={this.onExpand}
             expandedKeys={expandedKeys}
             autoExpandParent={autoExpandParent}
             checkedKeys={checkItem}
             onCheck={this.onCheck}
           >
             {routerTree}
           </Tree>
         </Col>
       </Row>
      </Card>
    );
  }
}

export default SetAuth;
