/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Divider,message,Form,Card,Row,Col,Button,Input} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from "umi/router";

@connect(({ craneModel,user, loading }) => ({
  craneModel,
  auth:user.authorization,
  loading: loading.effects['craneModel/getManufacturers'],
}))
class CraneManufacturer extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'craneFactoryId',
    placeHolder:formatMessage({id:'app.craneModel.factory'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.craneModel.factory'}),
      dataIndex: 'craneFactoryName'
    },
    {
      title: formatMessage({id:'app.craneModel.nation'}),
      dataIndex: 'nation',
    },
    {
      title: formatMessage({id:'app.common.description'}),
      dataIndex: 'description',
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.model ? (
            <Fragment>
              <a className='m-r-10' onClick={() => this.modelList(record)}>
                <FormattedMessage id = 'app.common.modelList' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.craneModel_edit ? (
            <Fragment>
              <a onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id = 'app.common.edit' />
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
    const { dispatch,craneModel } = this.props;
    const {manufacturerPageNumber = 0, manufacturerPageSize = 10} = craneModel;
    const params = {...this.state.params,...{pageNumber:manufacturerPageNumber,pageSize:manufacturerPageSize}};
    this.setState({params});
    dispatch({
      type: 'craneModel/getManufacturers',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'craneModel/setPage',
      payload:{manufacturerPageNumber:page - 1,manufacturerPageSize:pageSize}
    });
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
      type: 'craneModel/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  /*新增*/
  addAndEdit = (type,record) => {
    const obj = {};
    if(type) obj.craneFactoryId = record.craneFactoryId;
    router.push({
      pathname:type ? '/base/craneModel/edit' : '/base/craneModel/add',
      state:obj
    });
  };
  /*型号列表*/
  modelList = (record) => {
    if(!record || !record.craneFactoryId) return;
    const obj = {};
    obj.craneFactoryId = record.craneFactoryId;
    router.push({
      pathname:'/base/craneModel/model/table',
      state:obj
    });
  };
  render() {
    const {craneModel,loading} = this.props;
    const {list,total} = craneModel;
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
                  <FormattedMessage id='app.common.search' />
                </Button>
                {this.props.auth.craneModel_add ? (
                  <Button type="primary" icon="plus" onClick={() => this.addAndEdit(0)}>
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

export default CraneManufacturer;
