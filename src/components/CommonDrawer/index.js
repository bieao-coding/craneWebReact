/*eslint-disable*/
import React, {PureComponent} from 'react';
import {Input,Row} from 'antd';
import styles from './index.less';
import $ from 'jquery';
class CommonDrawer extends PureComponent{
  state = {
    searchValue:''
  };
  componentDidMount() {
    $(document).mousedown((e)=>{
      const select = $('#select');
      const drawer = $('#drawer');
      if(select.is(e.target) || select.has(e.target).length || drawer.is(e.target) || drawer.has(e.target).length){ // Mark 1
      }else{
        if(this.props.backVisible) this.props.backVisible(false);
        this.onChange({target:{value:''}});
      }
    });
  };
  onChange = (e) => {
    const search = e.target.value;
    this.setState({searchValue:search});
    if(this.props.onChange){
      this.props.onChange(search);
    }
  };
  clickLi = (e,item) => {
    if(this.props.clickItem){
      this.props.clickItem(item);
    }
  };
  getLi(data){
    return data.map((item,index)=><li className='li' title={item} key={index} onDoubleClick={(e) => this.clickLi(e,item)}>{item}</li>);
  }
  render(){
    const {visible,dataList}  = this.props;
    const {searchValue} = this.state;
    return (
      <div className={styles.commonDrawer} >
        <div id='drawer' className={styles.content} style={visible ? {transform:'translateX(0)'}:{transform: 'translateX(140px)'}}>
          <Row className={styles.search}><Input placeholder="搜索" value={searchValue}  onChange={this.onChange}/></Row>
          <ul>{this.getLi(dataList)}</ul>
        </div>
      </div>
    );
  }
}
export default CommonDrawer;
