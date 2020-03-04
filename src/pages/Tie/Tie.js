/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import {Card,Row,Col,Tree,Button } from 'antd';
import {transPingTreeToChildrenUnique} from '@/utils/utils'

const { TreeNode } = Tree;
@connect(({ tie, loading }) => ({
  tie,
  loading: loading.effects['tie/getTree'],
}))
class Tie extends React.Component {
  maxHeight = window.innerHeight - 64 - 40;
  state = {
    loading:false,
    originalTree:[],
    tree:[],
    defaultExpand:[],
    checkItem:[]
  };
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getTreeData();
  }
  /*请求事件*/
  getTreeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tie/getTree',
      payload:{hasCrane:1,userId:1},
      callback:(res)=>{
        const treeData = transPingTreeToChildrenUnique({id:'id',pid:'pid',children:'children'},res,{name:['key','title'],value:['id','name'],isUnique:0});
        const defaultExpand = [];
        treeData.forEach((item)=>{
          defaultExpand.push(item.key);
        });

        this.setState({tree:treeData,originalTree:res,defaultExpand:defaultExpand});
      }
    });
  };
  saveAuth = () => {
    const { dispatch } = this.props;
    const {originalTree,checkItem} = this.state;
    const params = [];
    originalTree.forEach((item)=>{
      if(checkItem.includes(item.key) && item.level === 3){
        params.push(item.id);
      }
    });
    this.setState({loading:true});
    dispatch({
      type: 'tie/saveTie',
      payload:params,
      callback:(res)=>{
        resMessage(res);
        this.setState({loading:false});
      }
    });
  };
  /*树的勾选事件*/
  onCheck = (checkedKeys) => {
    this.setState({checkItem:checkedKeys});
  };
  render() {
    const {tree,checkItem,loading,defaultExpand} = this.state;
    const loop = (data) => data.map((item) => {
      if(item.title){
        const title = <span>{item.title}</span>;
        if (item.children) {
          return (
            <TreeNode key={item.key} title={title}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode title={title} key={item.key}/>;
      }
    });
    return (
      <Card style = {{ height: `${this.maxHeight}px`}}>
        <Row type="flex" justify="space-between">
          <span className='title'>铁总专用</span>
          <Button type="primary" loading={loading} icon="save" onClick={()=>this.saveAuth()}>
            保存
          </Button>
        </Row>
        <Row style = {{ height: `calc(100% - 60px)`,overflow:'auto' }}>
          <Col>
            <Tree
              checkable
              expandedKeys = {defaultExpand}
              checkedKeys={checkItem}
              onCheck={this.onCheck}
            >
              {loop(tree)}
            </Tree>
          </Col>
        </Row>
      </Card>
    );
  }
}

export default Tie;
