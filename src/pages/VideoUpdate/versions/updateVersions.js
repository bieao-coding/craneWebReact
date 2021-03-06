/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Popconfirm,Form,Card,Row,Col,Button,Input} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {resMessage} from '@/utils/utils'
import CommonTable from '@/components/CommonTable';
import router from 'umi/router';
@connect(({ videoUpdate, loading }) => ({
  videoUpdate,
  loading: loading.effects['videoUpdate/getVersion'],
}))
class UpdateVersions extends Component {
  state = {
    projectId:null,
    selectKeys:null,
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'versionName',
    placeHolder:formatMessage({id:'app.device.versionName'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.device.versionName'}),
      dataIndex: 'versionName',
      width:100
    },
    {
      title: 'MD5',
      dataIndex: 'md5',
      width:300
    },
    {
      title: formatMessage({id:'app.device.softwareSize'}),
      dataIndex: 'fileSize',
      width:100
    },
    {
      title: formatMessage({id:'app.device.insertTime'}),
      dataIndex: 'insertTime',
      width:200
    },
    {
      title: formatMessage({id:'app.common.options'}),
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.choose(record)}>
            <FormattedMessage id='app.device.choose' />
          </a>
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({projectId:location.projectId,selectKeys:location.selectKeys},()=>{
        this.getList();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'videoUpdate/getVersion',
      payload:{...this.state.params,...{projectId:this.props.location.state.projectId}}
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
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
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  choose = (record) => {
    if(!record.versionName)  return;
    router.push({
      pathname:'/device/video/update/crane',
      state:{...record,...{projectId:this.state.projectId,selectKeys:this.state.selectKeys}}
    })
  };
  render() {
    const {videoUpdate,loading} = this.props;
    const {list,total} = videoUpdate;
    return (
      <div className='p-l-10'>
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
          currentPage = {this.state.params.pageNumber + 1}
          pageSize = {this.state.params.pageSize}
          onChange = {this.onPageChange}
        />
      </div>
    );
  }
}

export default UpdateVersions;
