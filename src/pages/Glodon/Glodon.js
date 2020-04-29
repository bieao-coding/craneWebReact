/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input,Table,Modal,message} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './glodon.less';
import router from 'umi/router';
import { resMessage } from '@/utils/utils';
@connect(({ glodon,user, loading }) => ({
  glodon,
  auth:user.authorization,
  loading: loading.effects['glodon/fetch'],
}))
class Glodon extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'projectId',
    placeHolder:formatMessage({id:'app.common.projectName'}),
    otherProject:[],
    otherClickProject:null,
    otherClickProjectId:'',
    chooseCrane:null,
    otherProjectLoading:false
  };
  allSnList = [];
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
      width:700
    },
    {
      title: formatMessage({id:'app.common.options'}),
      width:50,
      render: (text, record) => (
        <Fragment>
          {this.props.auth.glodon_edit ? (
            <Fragment>
              <a className='m-r-10' onClick={() => this.edit(record)}>
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
  /*选择*/
  choose = (crane,project) => {
    this.setState({otherProject:[]})
    this.props.dispatch({
      type: 'glodon/getOtherProject',
      payload:project.projectId,
      callback:(res)=>{
        this.setState({otherProject:res.list})
      }
    });
    this.setState({
      visible: true,
      chooseCrane:{...crane,...{projectName:project.projectName}}
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    this.setState({
      params:{...this.state.params,...{search:e.target.value}}
    });
  };

  handleOk = e => {
    const {chooseCrane,otherClickProject} = this.state;
    if(!chooseCrane || !otherClickProject) return;
    this.setState({otherProjectLoading:true});
    this.props.dispatch({
      type: 'glodon/otherProject',
      payload:{projectSelectVo:otherClickProject,craneVo:chooseCrane},
      callback:(res)=>{
        if(res.status === 'Success'){
          message.success('操作成功');
          this.setState({
            visible: false,
          });
          this.getList();
        }
        this.setState({otherProjectLoading:false});
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };
  clickProject = (record) => {
    this.setState({otherClickProjectId:record.projectId,otherClickProject:record});
  };
  expandedRowRender = (record) => {
    const craneList = record.craneList.map((item,index)=>{return {...item,...{index:index}}});
    const columns = [
      { title: formatMessage({id:'app.common.craneName'}), dataIndex: 'craneNumber' },
      { title: 'SN', dataIndex: 'sn'},
      { title: 'UUID', dataIndex: 'uuid'},
      {
        title: formatMessage({id:'app.common.options'}),
        width:100,
        render: (text, rec) => (
          <Fragment>
            {this.props.auth.glodon_edit ? (
              <Fragment>
                <a disabled={!rec.sn || rec.valid === 2} className='m-r-10' onClick={() => this.choose(rec,record)}>
                  <FormattedMessage id='app.common.choose' />
                </a>
              </Fragment>
            ):(<Fragment></Fragment>)}
          </Fragment>
        ),
      },
    ];
    return <Table columns = {columns} dataSource={craneList} pagination={false} />;
  };
  render() {
    const {glodon,loading} = this.props;
    const {list,total} = glodon;
    const {rowKey,params,otherProject,otherClickProjectId,otherProjectLoading} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline">
          <Row gutter={{ md:8,sm:8,xs: 8 }} className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {this.state.placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search' />
                </Button>
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
          expandedRowRender={this.expandedRowRender}
          currentPage = {params.pageNumber + 1}
          pageSize = {params.pageSize}
          onChange = {this.onPageChange}
        />
        <Modal
          title={formatMessage({id:'app.common.chooseOtherProject'})}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className={styles.globonModal}
          confirmLoading={otherProjectLoading}
        >
          {
            otherProject.map((res)=> <p className={otherClickProjectId === res.projectId ? [styles.click,styles.other].join(' ') : styles.other} onClick={()=>this.clickProject(res)} key={res.projectId}>{res.projectName}</p>)
          }
        </Modal>
      </Card>
    );
  }
}

export default Glodon;
