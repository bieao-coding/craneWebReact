/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input,Select} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
const Option = Select.Option;
@connect(({ antiList,user, loading }) => ({
  antiList,
  auth:user.authorization,
  loading: loading.effects['antiList/fetch'],
}))
class AntiList extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
      onlineCondition:0
    },
    rowKey:'sn',
    placeHolder:'sn',
  };
  /*列名*/
  columns = [
    {
      title: 'SN',
      dataIndex: 'sn'
    },
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName'
    },
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'online',
      align:'center',
      render(val,record) {
        return <i className = {record.online ? 'iconfont icon-signal online-color':'iconfont icon-signal offline-color'}/>;
      }
    },
    {
      title:formatMessage({id:'app.common.lastLoginTime'}),
      dataIndex: 'lastLoginTime',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.antiList_record ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10'  onClick={() =>  this.bindRecord(record)}>
                <FormattedMessage id='app.common.bindRecord' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,antiList } = this.props;
    const {pageNumber = 0, pageSize = 10} = antiList;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'antiList/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'antiList/setPage',
      payload:{pageNumber:page - 1,pageSize}
    })
    this.setState({
      params:obj
    },()=>{
      this.getList();
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    this.setState({
      params:{...this.state.params,...{search:e.target.value}}
    });
  };
  /*查询事件*/
  search = (e) => {
    e.preventDefault();
    this.props.dispatch({
      type: 'antiList/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  /*新增*/
  add = () => {
    router.push('/device/anti/list/add');
  };
  /*查看绑定记录*/
  bindRecord = (record) => {
    if(!record || !record.sn) return;
    router.push({
      pathname:'/device/anti/list/record',
      state:{sn:record.sn}
    });
  };
  /*选择变化*/
  selectChange = (value) => {
    this.setState({params:{...this.state.params,...{onlineCondition:value}}})
  };
  render() {
    const {antiList,loading} = this.props;
    const {list,total} = antiList;
    const {placeHolder,rowKey,params} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline" className = 'm-b-10'>
          <Row gutter={{ md:8,sm:8,xs: 8 }}>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {2} xl = {2} lg ={3} xs = {4}>
              <Select value={params.onlineCondition} onChange={this.selectChange}>
                <Option value={0} key={0}>{<FormattedMessage id='app.common.all'/>}</Option>
                <Option value={1} key={1}>{<FormattedMessage id='app.common.online'/>}</Option>
                <Option value={2} key={2}>{<FormattedMessage id='app.common.offline'/>}</Option>
              </Select>
            </Col>
            <Col xxl = {17} xl = {16} lg ={14} xs = {12}>
              <Row type="flex" justify="space-between">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search' />
                </Button>
                {this.props.auth.antiList_add ? (
                  <Button type="primary" icon="plus" onClick={this.add}>
                    <FormattedMessage id='app.common.add' />
                  </Button>
                ):(<Fragment></Fragment>)}
              </Row>
            </Col>
          </Row>
        </Form>
        <CommonTable
          loading={loading}
          list = {list}
          rowKey = {rowKey}
          columns = {this.columns}
          total = {total}
          currentPage = {params.pageNumber + 1}
          pageSize = {params.pageSize}
          onChange = {this.onPageChange}
        />
      </Card>
    );
  }
}

export default AntiList;
