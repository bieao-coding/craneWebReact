/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input,Table} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';

import router from 'umi/router';
@connect(({ glodon,user, loading }) => ({
  glodon,
  auth:user.authorization,
  loading: loading.effects['glodon/fetch'],
}))
class Glodon extends Component {
  state = {
    params:{
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'projectId',
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName',
      width:300
    },
    {
      title: 'Token',
      dataIndex: 'token',
    },
    {
      title: formatMessage({id:'app.common.options'}),
      width:100,
      render: (text, record) => (
        <Fragment>
          {this.props.auth.glodon_edit ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.edit(record)}>
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
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,glodon } = this.props;
    const {pageNumber = 0, pageSize = 10} = glodon;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'glodon/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'glodon/setPage',
      payload:{pageNumber:page - 1,pageSize}
    })
    this.setState({
      params:obj
    },()=>{
      this.getList();
    });
  };
  /*查询事件*/
  search = (e) => {
    e.preventDefault();
    this.props.dispatch({
      type: 'glodon/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  /*新增*/
  edit = (record) => {
    router.push({
      pathname:'/foreign/glodon/edit',
      state:{projectId:record.projectId}
    });
  };
  expandedRowRender = (record) => {
    const craneList = record.craneList.map((item,index)=>{return {...item,...{index:index}}});
    const columns = [
      { title: formatMessage({id:'app.common.craneName'}), dataIndex: 'craneNumber',width:'30%' },
      { title: 'SN', dataIndex: 'sn',width:'30%'},
      { title: 'UUID', dataIndex: 'uuid'}
    ];
    return <Table columns = {columns} dataSource={craneList} pagination={false} />;
  };
  render() {
    const {glodon,loading} = this.props;
    const {list,total} = glodon;
    const {rowKey,params} = this.state;
    return (
      <Card>
        <CommonTable
          loading={loading}
          list = {list}
          rowKey = {rowKey}
          columns = {this.columns}
          total = {total}
          expandedRowRender={this.expandedRowRender}
          currentPage = {params.pageNumber + 1}
          pageSize = {params.pageSize}
          onChange = {this.onPageChange}
        />
      </Card>
    );
  }
}

export default Glodon;
