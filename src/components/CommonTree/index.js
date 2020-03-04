/*eslint-disable*/
import React, {PureComponent} from 'react';
import {Tree, Input} from 'antd';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
class CommonTree extends PureComponent{
  constructor(props){
    super(props);
    this.state = {
      expandedKeys: [],
      autoExpandParent: false,
      searchValue: '',
    }
  }
  /*递归查找*/
  getParentKey = (search, tree,parentKey) => {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if(node.children.some(item => item.title.indexOf(search) > -1)){
          parentKey.push(node.key.toString());
        }
        this.getParentKey(search,node.children,parentKey);
      }
    }
    return parentKey;
  };
  /*展开*/
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  /*值更改*/
  onChange = (e) => {
    const value = e.target.value.toString();
    if(!!value){
      const keys = this.getParentKey(value,this.props.data,[]);
      this.setState({
        expandedKeys:keys
      });
    }
    this.setState({
      searchValue: value,
      autoExpandParent: true
    });
  };
  render(){
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    const loop = data => data.map((item) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.key} title={title}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={title} />;
    });
    return (
      <div>
        <Search className = 'm-b-10' placeholder="搜索" onChange={this.onChange} />
        <Tree
          showLine
          onSelect = {this.props.onSelect}
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          selectedKeys = {this.props.selectedKeys}
        >
          {loop(this.props.data)}
        </Tree>
      </div>
    );
  }
}
export default CommonTree;
