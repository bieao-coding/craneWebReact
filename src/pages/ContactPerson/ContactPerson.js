/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import { Form, Card, Row, Col, Button, Input, Popconfirm } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import router from "umi/router";

@connect(({ contactPerson,user, loading }) => ({
  contactPerson,
  auth:user.authorization,
  loading: loading.effects['contactPerson/fetch'],
}))
class ContactPerson extends React.Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'contactId',
    placeHolder:formatMessage({id:'app.contact.search'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.contact.contactName'}),
      dataIndex: 'contactName',
    },
    {
      title: formatMessage({id:'app.contact.contactMobile'}),
      dataIndex: 'contactMobile',
    },
    {
      title: formatMessage({id:'app.contact.contactEmail'}),
      dataIndex: 'contactEmail',
    },
    {
      title: formatMessage({id:'app.contact.contactTitle'}),
      dataIndex: 'contactTitle',
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.contactPerson_edit ? (
            <Fragment>
              <a className='m-r-10' onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.edit' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.contactPerson_delete ? (
            <Fragment>
              <Popconfirm
                title={<FormattedMessage id='app.common.delete-sure'/>}
                onConfirm={() =>  this.delete(record)}
                okText={<FormattedMessage id='app.common.sure'/>}
                cancelText={<FormattedMessage id='app.common.cancel'/>}
              >
                <a>
                  <FormattedMessage id='app.common.delete'/>
                </a>
              </Popconfirm>
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
    const { dispatch ,contactPerson} = this.props;
    const {pageNumber = 0, pageSize = 10} = contactPerson;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'contactPerson/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'contactPerson/setPage',
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
      type: 'contactPerson/setPage',
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
    if(type) obj.contactId = record.contactId;
    router.push({
      pathname:type ? '/base/contactPerson/edit' : '/base/contactPerson/add',
      state:obj
    });
  };
  /*分配权限*/
  delete = (record) => {
    if(!record || !record.contactId) return;
    this.props.dispatch({
      type: 'contactPerson/delete',
      payload:record.contactId,
      callback:(res) => {
        resMessage(res);
        if(res && res.status === 'Success'){
          const obj = {...this.state.params,...{pageNumber:0}};
          this.setState({
            params:obj
          },() => {
            this.getList();
          });
        }
      }
    });
  };
  render() {
    const {contactPerson,loading} = this.props;
    const {list,total} = contactPerson;
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
                {this.props.auth.contactPerson_add ? (
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

export default ContactPerson;
