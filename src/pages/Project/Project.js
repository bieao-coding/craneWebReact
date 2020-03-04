/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {Form,Card,Row,Col,Button,Input,Tag} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';

@connect(({ project,user, loading }) => ({
  project,
  auth:user.authorization,
  loading: loading.effects['project/fetch'],
}))
class Project extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'projectId',
    placeHolder:formatMessage({id:'app.common.projectName'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName',
      width:'20%'
    },
    {
      title: formatMessage({id:'app.common.workCompany'}),
      dataIndex: 'workCompanyName',
      render: (text, record) => (
        !!record.workCompanyName ? (
          <Fragment>
            <Tag color='green'>{record.workCompanyName}</Tag>
          </Fragment>
        ):(<Fragment></Fragment>)
      )
    },
    {
      title: formatMessage({id:'app.common.buildCompany'}),
      dataIndex: 'buildCompanyName',
      render: (text, record) => (
        !!record.buildCompanyName ? (
          <Fragment>
            <Tag color='blue'>{record.buildCompanyName}</Tag>
          </Fragment>
        ):(<Fragment></Fragment>)
      )
    },
    {
      title: formatMessage({id:'app.common.supervisionCompany'}),
      dataIndex: 'supervisionCompanyName',
      render: (text, record) => (
        !!record.supervisionCompanyName ? (
          <Fragment>
            <Tag color='magenta'>{record.supervisionCompanyName}</Tag>
          </Fragment>
        ):(<Fragment></Fragment>)
      )
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'status',
      render: (text, record) => (
        <Fragment>
          <Tag color={!record.status ? 'orange' : ((record.status === 1) ? 'magenta':'green')}>{
            !record.status ? formatMessage({id:'app.common.processing'}) : ((record.status === 1) ? formatMessage({id:'app.common.shut-down'}):formatMessage({id:'app.common.finish'}))}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.project_edit ? (
            <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.addAndEdit(1,record)}>
              <FormattedMessage id='app.common.edit' />
            </a>
          ):(<Fragment></Fragment>)}
          {this.props.auth.project_ext ? (
            <a href = 'javascript:void(0)' onClick={() => this.addAndEdit(2,record)}>
              <FormattedMessage id='app.common.ext' />
            </a>
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
    const { dispatch,project} = this.props;
    const {pageNumber = 0, pageSize = 10} = project;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'project/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'project/setPage',
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
      type: 'project/setPage',
      payload:{pageNumber:0}
    });
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    });

  };
  /*新增*/
  addAndEdit = (type,record) => {
    const obj = {};
    if(type) obj.projectId = record.projectId;
    router.push({
      pathname:type ? (type === 1 ? '/base/project/edit' : '/base/project/ext') : '/base/project/add',
      state:obj
    });
  };
  render() {
    const {project,loading} = this.props;
    const {placeHolder,rowKey,params} = this.state;
    const {list,total} = project;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline" className = 'm-b-10'>
          <Row gutter={{ md:8,sm:8,xs: 8 }} >
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="space-between">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search'/>
                </Button>
                {this.props.auth.project_add ? (
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

export default Project;
