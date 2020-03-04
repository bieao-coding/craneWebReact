/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Popconfirm,Divider,Form,Card,Row,Col,Button,Input,Tag} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import router from "umi/router";

@connect(({ operator,user, loading }) => ({
  operator,
  auth:user.authorization,
  loading: loading.effects['operator/fetch'],
}))
class Operator extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'identityNumber',
    placeHolder:formatMessage({id:'app.operator.name-id'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.operator.workerName'}),
      dataIndex: 'workerName',
    },
    {
      title: formatMessage({id:'app.operator.identityNumber'}),
      dataIndex: 'identityNumber',
    },
    {
      title: formatMessage({id:'app.common.phone'}),
      dataIndex: 'telephone',
    },
    {
      title: formatMessage({id:'app.operator.template'}),
      dataIndex: 'template',
      render: (text, record) => (
        <Fragment>
          <Tag color={record.template ? 'green' : 'red'}>{record.template ? formatMessage({id:'app.operator.has'}) : formatMessage({id:'app.operator.no'})}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.operator_edit ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.edit' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.operator_feature ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.feature(record)}>
                <FormattedMessage id='app.common.feature' />
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
    const { dispatch,operator } = this.props;
    const {pageNumber = 0, pageSize = 10} = operator;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'operator/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'operator/setPage',
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
      type: 'operator/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    });
  };
  /*新增*/
  addAndEdit = (type,record) => {
    const obj = {};
    if(type) obj.workerId = record.workerId;
    router.push({
      pathname:type ? '/base/operator/edit' : '/base/operator/add',
      state:obj
    });
  };
  // 特征信息
  feature = (record) => {
    if(!record || !record.workerId) return;
    const obj = {};
    obj.workerId = record.workerId;
    router.push({
      pathname:'/base/operator/feature',
      state:obj
    });
  };
  render() {
    const {operator,loading} = this.props;
    const {list,total} = operator;
    const {params} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline">
          <Row gutter={{ md:8,sm:8,xs: 8 }} className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {this.state.placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="space-between">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search'/>
                </Button>
                {this.props.auth.operator_add ? (
                  <Button type="primary" icon="plus" onClick={() => this.addAndEdit(0)}>
                    <FormattedMessage id='app.common.add'/>
                  </Button>
                ):(<Fragment></Fragment>)}
              </Row>
            </Col>
          </Row>
        </Form>
        <CommonTable
          loading={loading}
          list = {list}
          rowKey = {this.state.rowKey}
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

export default Operator;
