/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input, Card, Button, Menu, Row, Col, } from 'antd';
import {connect} from "dva/index";
import styles from './setAuth.less'
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
const { Item } = Menu;
const menuMap = {
  workCompanyTree: formatMessage({id:'app.user.workCompanyTree'}),
  buildCompanyTree: formatMessage({id:'app.user.buildCompanyTree'}),
  supervisionCompanyTree: formatMessage({id:'app.user.supervisionCompanyTree'}),
  operators: formatMessage({id:'app.user.operators'}),
  nvr: formatMessage({id:'app.user.nvr'}),
  antiDev: formatMessage({id:'app.user.antiDev'}),
  videoDev: formatMessage({id:'app.user.videoDev'}),
};
@connect(({}) => ({

}))
@Form.create()
class SetAuth extends Component {
  constructor(props) {
    super(props);
    const {match, location} = props;
    const key = location.pathname.replace(`${match.path}/`, '');
    this.state = {
      mode: 'inline',
      menuMap,
      selectKey: menuMap[key] ? key : 'workCompanyTree',
      title:''
    };
  }
  userInfo = {};
  // DOM加载完成后执行
  componentDidMount() {
    this.userInfo = this.props.location.state;
    this.setState({title:this.userInfo.title})
  }
  selectKey = ({ key }) => {
    router.push({
      pathname:`/system/platformUser/setAuth/${key}`,
      state:this.userInfo
    });
    this.setState({
      selectKey: key,
    });
  };
  getmenu = () => {
    const { menuMap } = this.state;
    return Object.keys(menuMap).map(item => <Item key={item}>{menuMap[item]}</Item>);
  };
  /*渲染*/
  render() {
    const { children } = this.props;
    const { mode, selectKey,title } = this.state;
    return (
      <Card className={styles.auth}>
        <Row className='title'>{title}</Row>
        <Row type='flex'>
          <Col  className={styles.left}>
            <Menu mode={mode} selectedKeys={[selectKey]} onClick={this.selectKey}>
              {this.getmenu()}
            </Menu>
          </Col>
          <Col className = 'flex1 p-l-10 p-r-10'>
            {children}
          </Col>
        </Row>
      </Card>
    )
  }
};
export default SetAuth;
