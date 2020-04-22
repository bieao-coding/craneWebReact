/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input,Tag} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from "umi/router";
import info from '@/defaultInfo';
@connect(({ craneModel,user, loading }) => ({
  craneModel,
  auth:user.authorization,
  loading: loading.effects['craneModel/getModels'],
}))
class CraneModel extends Component {
  state = {
    list:[],
    total:0,
    params:{
      craneFactoryId:null,
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'craneModelId',
    placeHolder:formatMessage({id:'app.craneModel.craneModelName'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.craneModel.craneModelName'}),
      dataIndex: 'craneModelName',
      width:150
    },
    {
      title: formatMessage({id:'app.common.craneType'}),
      dataIndex: 'craneType',
      width:100,
      render: (text, record) => (
        <Fragment>
          <Tag color={!record.craneType ? 'green' : ((record.craneType === 1) ? 'blue':'orange')}>{!record.craneType ? formatMessage({id:'app.common.flat-crane'}) : ((record.craneType === 1) ? formatMessage({id:'app.common.movable-crane'}):formatMessage({id:'app.common.head-crane'}))}</Tag>
        </Fragment>
      ),
    },
    {
      title:formatMessage({id:'app.craneModel.slewGearNumber'}),
      dataIndex: 'slewGearNumber',
      align:'center',
      width:150,
    },
    {
      title: formatMessage({id:'app.craneModel.slewGearModulus'}),
      dataIndex: 'slewGearModulus',
      align:'center',
      width:200,
    },
    {
      title: formatMessage({id:'app.craneModel.slewLimitGearNumber'}),
      dataIndex: 'slewLimitGearNumber',
      align:'center',
      width:100,
    },
    {
      title: formatMessage({id:'app.craneModel.radiusDriveRatio'}),
      dataIndex: 'radiusDriveRatio',
      align:'center',
      width:150,
    },
    {
      title: formatMessage({id:'app.craneModel.radiusFrame'}),
      dataIndex: 'radiusFrame',
      align:'center',
      width:200,
      render(val,record) {
        return <span>{!record.radiusFrame ? formatMessage({id:'app.craneModel.radius-commonFrame'}) : formatMessage({id:'app.craneModel.radius-connectFrame'})}</span>;
      },
    },
    {
      title: formatMessage({id:'app.craneModel.heightDriveRatio'}),
      dataIndex: 'heightDriveRatio',
      align:'center',
      width:150,
    },
    {
      title: formatMessage({id:'app.craneModel.heightFrame'}),
      dataIndex: 'heightFrame',
      align:'center',
      width:200,
      render(val,record) {
        return <span>{!record.heightFrame ? formatMessage({id:'app.craneModel.height-commonFrame'}) : formatMessage({id:'app.craneModel.height-connectFrame'})}</span>;
      },
    },
    {
      title: formatMessage({id:'app.craneModel.loadFrameType'}),
      dataIndex: 'loadFrameType',
      align:'center',
      width:150,
      render(val,record) {
        return <span>{
          !record.loadFrameType ? formatMessage({id:'app.craneModel.load-commonFrame'}) : (record.loadFrameType === 1 ? formatMessage({id:'app.craneModel.ping-frame'}):(record.loadFrameType === 2 ? formatMessage({id:'app.craneModel.group-frame'}):formatMessage({id:'app.craneModel.plus-frame'})))}</span>;
      },
    },
    {
      title: formatMessage({id:'app.common.options'}),
      width:100,
      render: (text, record) => (
        <Fragment>
          {this.props.auth.model_edit ? (
            <a onClick={() =>  this.addAndEdit(1,record)}>
              <FormattedMessage id='app.common.edit'/>
            </a>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.craneFactoryId){
      this.setState({params:{...this.state.params,...{craneFactoryId:params.craneFactoryId}}},()=>{
        this.getList();
      });
    }
  }
  /*请求事件*/
  getList = () => {
    if(!this.state.params.craneFactoryId) return;
    const { dispatch,craneModel } = this.props;
    const {modelPageNumber = 0, modelPageSize = 10} = craneModel;
    const params = {...this.state.params,...{pageNumber:modelPageNumber,pageSize:modelPageSize}};
    this.setState({params});
    dispatch({
      type: 'craneModel/getModels',
      payload:params,
      callback:(res) => {
        if(res && !!res.list){
          this.setState({
            list:res.list,
            total:res.total
          })
        }
      }
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'craneModel/setPage',
      payload:{modelPageNumber:page - 1,modelPageSize:pageSize}
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
    obj.craneFactoryId = this.state.params.craneFactoryId;
    if(type) obj.craneModelId = record.craneModelId;
    router.push({
      pathname:type ? '/base/craneModel/model/edit' : '/base/craneModel/model/add',
      state:obj
    });
  };
  render() {
    const {loading} = this.props;
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
                {this.props.auth.model_add ? (
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
          list = {this.state.list}
          rowKey = {this.state.rowKey}
          columns = {this.columns}
          total = {this.state.total}
          currentPage = {params.pageNumber + 1}
          pageSize = {params.pageSize}
          onChange = {this.onPageChange}
          scroll={{x:1650}}
        />
      </Card>
    );
  }
}

export default CraneModel;
