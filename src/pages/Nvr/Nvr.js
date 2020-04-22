/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Divider,Popconfirm,message,Form,Card,Row,Col,Button,Input,Tag} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import router from "umi/router";
@connect(({ nvr,user, loading }) => ({
  nvr,
  auth:user.authorization,
  loading: loading.effects['nvr/fetch'],
}))
class Nvr extends Component {
  state = {
    list:[],
    total:0,
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'nvrId',
    placeHolder:formatMessage({id:'app.nvr.sn-code'}),
  };
  token = null;
  index1 = 0;
  AppKey = 'e2cba1a253ba4aa7a6d23293cea3bcd3';
  Secret = 'c2f27bf2abaae384e50ad12e7952b32d';
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.nvr.nvrSn'}),
      dataIndex: 'nvrSn',
    },
    {
      title: formatMessage({id:'app.nvr.nvrCode'}),
      dataIndex: 'nvrCode',
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
      title: formatMessage({id:'app.nvr.usedCraneCount'}),
      dataIndex: 'usedCraneCount',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.nvr_edit ? (
            <Fragment>
              <a className='m-r-10' onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.edit' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.nvr_cancelPassword ? (
            <Fragment>
              <a className='m-r-10' onClick={() =>  this.cancelPassword(record)}>
                <FormattedMessage id='app.common.cancelPassword' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.nvr_show ? (
            <Fragment>
              <a  onClick={() =>  this.seeBind(record)}>
                <FormattedMessage id='app.common.bind' />
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
    const { dispatch,nvr } = this.props;
    const {pageNumber = 0, pageSize = 10} = nvr;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'nvr/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'nvr/setPage',
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
      type: 'nvr/setPage',
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
    if(type) obj.nvrId = record.nvrId;
    router.push({
      pathname:type ? '/base/nvr/edit' : '/base/nvr/add',
      state:obj
    });
  };
  /*查看所属塔机*/
  seeBind = (record) => {
    if(!record || !record.nvrId) return;
    router.push({
      pathname:'/base/nvr/show',
      state:{nvrId:record.nvrId}
    });
  };
  /*取消加密*/
  cancelPassword = (record) => {
    if(!record || !record.nvrId) return;
    this.getToken(record);
  };
  /*获取token*/
  getToken(params){
    const { dispatch } = this.props;
    if(!this.token){
      dispatch({
        type: 'nvr/getToken',
        payload:{appKey:this.AppKey,appSecret:this.Secret},
        callback:(res)=>{
          localStorage.setItem('token',res.data.accessToken);
          this.token = res.data.accessToken;
          this.cancel(params);
        }
      });
    }else{
      this.cancel(params);
    }
  }
  /*检查token过期*/
  checkToken(params){
    if(!this.index1){
      this.token = null;
      this.getToken(params);
      this.index1++;
    }else{
      message.error(formatMessage({id:'app.common.error'}));
    }
  }
  /*取消加密*/
  cancel(params){
    this.props.dispatch({
      type: 'nvr/cancelPassword',
      payload:{accessToken:this.token,deviceSerial:params.nvrSn,validateCode:params.nvrCode},
      callback:(res)=>{
        if(res.code === '200' || res.code === '60016'){ // 60016未加密
          message.success(formatMessage({id:'app.common.success'}))
        }else if(res.code === '10002'){
          this.checkToken(params);
        }else{
          message.error(formatMessage({id:`app.nvr.${res.code}`}));
        }
      }
    });
  }

  render() {
    const {nvr,loading} = this.props;
    const {list,total} = nvr;
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
                {this.props.auth.nvr_add ? (
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

export default Nvr;
