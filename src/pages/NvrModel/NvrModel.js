/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Divider,Popconfirm,message,Form,Card,Row,Col,Button,Input,Tag} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import router from "umi/router";

@connect(({ nvrModel,user, loading }) => ({
  nvrModel,
  auth:user.authorization,
  loading: loading.effects['nvrModel/fetch'],
}))
class NvrModel extends Component {
  state = {
    list:[],
    total:0,
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'nvrModelId',
    placeHolder:formatMessage({id:'app.nvr.modelName'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.nvr.modelName'}),
      dataIndex: 'modelName',
    },
    {
      title: formatMessage({id:'app.nvr.nvrChannelCount'}),
      dataIndex: 'nvrChannelCount',
    },
    {
      title: formatMessage({id:'app.nvr.nvrFactory'}),
      dataIndex: 'factoryId',
      render: (text, record) => {
        const result = record.factoryId == 1 ? {color:'green',text:formatMessage({id:'app.nvr.dahua'})} : (record.factoryId == 2 ? {color:'cyan',text:formatMessage({id:'app.nvr.yushi'})}:{color:'blue',text:formatMessage({id:'app.nvr.haikang'})});
        return (
          <Fragment>
            <Tag color={result.color}>{result.text}</Tag>
          </Fragment>
        )
      }
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.nvrModel_edit ? (
            <Fragment>
              <a className='m-r-10' onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.edit' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.token = localStorage.getItem('token');
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,nvrModel } = this.props;
    const {pageNumber = 0, pageSize = 10} = nvrModel;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'nvrModel/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'nvrModel/setPage',
      payload:{pageNumber:page - 1,pageSize}
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
      type: 'nvrModel/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    });
  };
  /*新增编辑*/
  addAndEdit = (type,record) => {
    let obj = {};
    if(type){
      if(!record || !record.nvrModelId) return;
      obj = {id:record.nvrModelId}
    }
    router.push({
      pathname:type ? '/base/nvrModel/edit' : '/base/nvrModel/add',
      state:obj
    });
  };
  render() {
    const {nvrModel,loading} = this.props;
    const {list,total} = nvrModel;
    const {rowKey,params} = this.state;
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
                {this.props.auth.nvrModel_add ? (
                  <Button type="primary" icon="plus" onClick={()=>this.addAndEdit(0)}>
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

export default NvrModel;
