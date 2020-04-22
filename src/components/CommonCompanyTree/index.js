/*eslint-disable*/
import React, {PureComponent} from 'react';
import {Tree, Input, Col, Row, Icon, Select} from 'antd';
import styles from './index.less';
import $ from 'jquery'
const Option = Select.Option;
const TreeNode = Tree.TreeNode;
class CommonCompanyTree extends PureComponent{
  minHeight = window.innerHeight - 50 - 20 - 40 - 2;
  constructor(props){
    super(props);
    this.state = {
      hover:false,
      click:false,
      expandedKeys:null,
      searchValue: '',
    }
  }
  windowHeight = 0;
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.drag($('.left-tree'));
    this.windowHeight = $(window).height() - 50 - 10;
    this.treeClick();
  }
  treeClick = () => {
    $('#search-tree').hover(()=>{
      this.setState({hover:true})
    },()=>{
      this.setState({hover:false})
    });
    $('#turn-left-right').click(()=>
      this.setState({click:!this.state.click})
    );
  };
  /*递归查找*/
  getSelectItem = (search, tree,selectItem) => {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if(node.name.indexOf(search) > -1){
        const newNode = JSON.parse(JSON.stringify(node));
        delete newNode.children;
        selectItem.push(newNode);
      }
      if (node.children) {
        this.getSelectItem(search,node.children,selectItem);
      }
    }
    return selectItem;
  };

  /*值更改*/
  onChange = (e) => {
    const value = e.target.value.toString();
    this.props.onSearchChange(value);
    this.setState({
      searchValue: value
    });
  };
  /*单位类型选择*/
  changeSelect = (value) => {
    this.setState({
      searchValue: '',
    });
    const {changeSelect} = this.props;
    if(changeSelect){
      changeSelect(value);
    }
  };
  /*实现滑动*/
  drag(obj) {
    let gapX,startx;
    obj.bind("mousedown", start);
    function start(event) {
      if (event.button == 0) {//判断是否点击鼠标左键
        gapX = event.clientX;
        startx = obj.scrollLeft();  // scroll的初始位置
        //movemove事件必须绑定到$(document)上，鼠标移动是在整个屏幕上的
        $(document).bind("mousemove", move);
        //此处的$(document)可以改为obj
        $(document).bind("mouseup", stop);
      }
      return false;//阻止默认事件或冒泡
    }
    function move(event) {
      const left = event.clientX - gapX; // 鼠标移动的相对距离
      obj.scrollLeft(startx - left);
      return false;//阻止默认事件或冒泡
    }
    function stop() {
      //解绑定，这一步很必要，前面有解释
      $(document).unbind("mousemove", move);
      $(document).unbind("mouseup", stop);
    }
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
  };
  render(){
    let { searchValue,hover,click } = this.state;
    const {options,onSelect,selectedKeys,data,defaultExpandedKeys,companySelect,onExpand} = this.props;
    const newOptions = options.map((item)=>(<Option value={item.value} key={item.value}>{item.name}</Option>));
    const loop = data => data.map((item) => {
      const index = item.name.indexOf(searchValue);
      const beforeStr = item.name.substr(0, index);
      const afterStr = item.name.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.name}</span>;
      if (item.children) {
        return (
          <TreeNode key={item.orgId} title={title} icon={<i className={['iconfont',this.selectIcon(item.businessLevel)].join(' ')}/>}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.orgId} title={title} icon={<i className={['iconfont',this.selectIcon(item.businessLevel)].join(' ')}/>}/>;
    });
    return (
      <Col id= 'search-tree' style={{minHeight:`${this.minHeight}px`}} className={[styles.searchTree,click ? styles.flex0 : ''].join(' ')}>
        <Row className='m-r-10'>
          <Select value={companySelect} style={{ width: '100%'}} className='m-b-10' placeholder="请选择单位" onChange={this.changeSelect}>
            {newOptions}
          </Select>
        </Row>
        <Row className='m-r-10'><Input placeholder="搜索" value={searchValue} onChange={this.onChange} /></Row>
        <Tree
          className='left-tree'
          showIcon
          onSelect = {onSelect}
          onExpand={onExpand}
          expandedKeys={defaultExpandedKeys}
          selectedKeys = {selectedKeys}
          switcherIcon={<Icon type="down" />}
        >
          {loop(data)}
        </Tree>
        <span id= 'turn-left-right' style={{top:`${this.windowHeight/2}px`}} className = {[styles.turnLeftRight,hover ? styles.hoverColor : ''].join(' ')}>
          <i className = {[styles.fontSize12,'iconfont icon-turn',click ? styles.rotate180 : ''].join(' ')}/>
        </span>
      </Col>
    );
  }
}
export default CommonCompanyTree;
