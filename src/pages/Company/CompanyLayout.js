/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {Row,Tag,Tabs,Card} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import info from '@/defaultInfo';
const TabPane = Tabs.TabPane;
@connect(({user}) => ({
  auth:user.authorization,
}))
class CompanyLayout extends Component {
  state = {
    projectId:null,
    activeKey:'workCompany',
    tabs:[]
  };
  tabsUrl = {
    workCompany:formatMessage({id:'app.common.workCompany'}),
    buildCompany:formatMessage({id:'app.common.buildCompany'}),
    supervisionCompany:formatMessage({id:'app.common.supervisionCompany'}),
    propertyCompany:formatMessage({id:'app.common.propertyCompany'}),
  };
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.setAuth();
    this.callback('workCompany');
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const {location} = nextProps;
    if(location.pathname == '/base/company'){
      this.callback('workCompany');
    }
  }
  /*按钮权限*/
  setAuth(){
    const keyObj = this.props.auth;
    const array = [];
    for(const key in this.tabsUrl) {
      if (keyObj[key]) {
        const content = this.tabsUrl[key];
        array.push(<TabPane tab={content} key={key}/>)
      }
    }
    this.setState({tabs:array})
  }

  callback = (key) => {
    this.setState({activeKey:key});
    router.push({
      pathname:`/base/company/${key}`
    });
  };
  render() {
    const {children} = this.props;
    const {title,activeKey,tabs} = this.state;
    return (
      <Card className='p-l-10'>
        <Row className='title'>{title}</Row>
        <Row>
          {tabs.length ? (
            <Tabs onChange={this.callback} activeKey={activeKey}>
              {tabs}
            </Tabs>
          ) : <Fragment></Fragment>}
        </Row>
        <Row>
          {children}
        </Row>
      </Card>
    );
  }
}

export default CompanyLayout;
