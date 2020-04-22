/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import {Form,Card,Row,Col,Button,Input} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import router from "umi/router";

@connect(({ role,user, loading }) => ({
  role,
  auth:user.authorization,
  currentUser:user.currentUser,
  loading: loading.effects['role/fetch'],
}))
class Roles extends React.Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'roleId',
    placeHolder:formatMessage({id:'app.role.roleName'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.role.roleName'}),
      dataIndex: 'roleName',
    },
    {
      title: formatMessage({id:'app.common.description'}),
      dataIndex: 'description',
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.role_edit && record.roleId !== 1 ? (
            <Fragment>
              <a className='m-r-10' onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.edit' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {(record.roleId === 1 ? (this.props.auth.role_auth && this.props.currentUser.userId === 1) : this.props.auth.role_auth) ? (
            <Fragment>
              <a className='m-r-10'  onClick={() =>  this.setAuth(record)}>
                <FormattedMessage id='app.role.setRole' />
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
    const { dispatch,role } = this.props;
    const {pageNumber = 0, pageSize = 10} = role;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'role/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'role/setPage',
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
      type: 'role/setPage',
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
    if(type) obj.roleId = record.roleId;
    router.push({
      pathname:type ? '/system/role/edit' : '/system/role/add',
      state:obj
    });
  };
  /*分配权限*/
  setAuth = (record) => {
    if(!record || !record.roleId) return;
    router.push({
      pathname:'/system/role/setAuth',
      state:{roleId:record.roleId}
    });
  };
  render() {
    const {role,loading} = this.props;
    const {list,total} = role;
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
                {this.props.auth.role_add ? (
                  <Button type="primary"  icon="plus" onClick={()=>this.addAndEdit(0)}>
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

export default Roles;
