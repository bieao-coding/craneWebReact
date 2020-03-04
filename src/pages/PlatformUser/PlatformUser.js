/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {resMessage,transPingTreeToChildren,recursionTopToKey,recursionTopToObj} from '@/utils/utils'
import {Divider,Popconfirm,Form,Card,Row,Col,Button,Input,Tag,Table } from 'antd';

import { formatMessage, FormattedMessage } from 'umi/locale';
@connect(({ platformUser,user, loading }) => ({
  platformUser,
  auth:user.authorization,
  userInfo:user.currentUser,
  loading: loading.effects['platformUser/getUsers'],
}))
class PlatformUser extends Component {
  state = {
    list:[],
    filterList:[],
    rowKey:'userId',
    placeHolder:formatMessage({id:'app.user.loginName'}),
    auth:{},
    expandKeys:[]
  };
  list = [];
  oldList = [];
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.user.loginName'}),
      dataIndex: 'userName',
    },
    {
      title: formatMessage({id:'app.user.realName'}),
      dataIndex: 'realName',
      align:'center',
    },
    {
      title: formatMessage({id:'app.user.roleName'}),
      dataIndex: 'roleName',
      align:'center',
    },
    {
      title: formatMessage({id:'app.user.loginCount'}),
      dataIndex: 'loginCount',
      align:'center',
    },
    {
      title: formatMessage({id:'app.user.lastLoginTime'}),
      dataIndex: 'lastLoginTime',
      align:'center',
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'status',
      render: (text, record) => (
        <Fragment>
          <Tag color={!record.status ? 'green' : 'red'}>{!record.status ? formatMessage({id:'app.common.enable'}) : formatMessage({id:'app.common.disable'})}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.platformUser_edit ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() =>  this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.edit'/>
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.platformUser_addNext ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.addAndEdit(2,record)}>
                <FormattedMessage id='app.common.addNext'/>
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.platformUser_resetPassword ? (
            <Fragment>
              <Popconfirm
                title={<FormattedMessage id='app.user.sure-reset'/>}
                onConfirm={() => this.resetPassword(record)}
                okText={<FormattedMessage id='app.common.sure'/>}
                cancelText={<FormattedMessage id='app.common.cancel'/>}
              >
                <a href = 'javascript:void(0)' className='m-r-10'>
                  <FormattedMessage id='app.common.resetPassword'/>
                </a>
              </Popconfirm>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.platformUser_setAuth ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.giveData(record)}>
                <FormattedMessage id='app.user.setResources'/>
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    if(this.props.userInfo){
      this.getList();
    }
  }
  /*请求事件*/
  getList(){
    const { dispatch } = this.props;
    dispatch({
      type: 'platformUser/getUsers',
      callback:(res)=>{
        this.oldList = JSON.parse(JSON.stringify(res));
        const list = transPingTreeToChildren({id:'userId',pid:'parentUserId',children:'children'},res);
        this.list = list;
        this.setState({filterList:list});
      }
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    const value = e.target.value;
    let newList = this.list,expandKeys = [];
    if(!!value){
      const res = recursionTopToObj(newList,newList,'userName','userId','parentUserId',value,false,null,[]);
      const newArray = [],obj = [];
      expandKeys = res;
      for(const index of res){
        if(!newArray.includes(index)){
          newArray.push(index);
          obj.push(this.oldList.filter((item)=>{return item.userId === index})[0])
        }
      }
      const newObj = JSON.parse(JSON.stringify(obj));
      newList = transPingTreeToChildren({id:'userId',pid:'parentUserId',children:'children'},newObj);
    }
    this.setState({filterList:newList},()=>{this.setState({expandKeys:expandKeys})});
    this.props.dispatch({
      type: 'platformUser/setPage',
      payload:{pageNumber:0}
    })
  };
  /*新增*/
  addAndEdit = (type,record) => {
    const obj = {};
    if(!type){
      obj.parentUserId = this.props.userInfo.userId;
      router.push({
        pathname:'/system/platformUser/add',
        state:obj
      });
    } else if (type === 1){
      obj.userId = record.userId;
      router.push({
        pathname:'/system/platformUser/edit',
        state:obj
      });
    }else{
      obj.parentUserId = record.userId;
      router.push({
        pathname:'/system/platformUser/addNext',
        state:obj
      });
    }
  };
  /*重置密码*/
  resetPassword = (record) => {
    const { dispatch } = this.props;
    if (!record && !record.userId) return;
    dispatch({
      type: 'platformUser/resetPassword',
      payload:record.userId,
      callback:(res)=>{
        resMessage(res);
      }
    });
  };
  /*分配资源*/
  giveData = (record) => {
    if (!record && !record.userId) return;
    const address = recursionTopToKey(this.list,'userName','userId',record.userId).reverse().join(' > ');
    router.push({
      pathname:'/system/platformUser/setAuth/workCompanyTree',
      state:{userId:record.userId,parentUserId:record.parentUserId,loginUserId:this.props.userInfo.userId,title:address}
    });
  };
  onChange = (pagination) => {
    const {current} = pagination;
    this.props.dispatch({
      type: 'platformUser/setPage',
      payload:{pageNumber:current}
    })
  };
  expand = (expandRowKeys) => {
    this.setState({expandKeys:expandRowKeys})
  };
  render() {
    const {loading,platformUser} = this.props;
    const {pageNumber = 0} = platformUser;
    const {placeHolder,rowKey,filterList,expandKeys} = this.state;
    return (
      <Card>
        <Form layout="inline" >
          <Row>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8} className = 'm-b-10'>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16} className = 'm-b-10'>
              <Row type="flex" justify="end">
                {this.props.auth.platformUser_add ? (
                  <Button type="primary" icon="plus" onClick={() => this.addAndEdit(0)}>
                    <FormattedMessage id='app.common.add'/>
                </Button>):(<Fragment></Fragment>)}
              </Row>
            </Col>
          </Row>
        </Form>
        <Table
          expandedRowKeys={expandKeys}
          onExpandedRowsChange={this.expand}
          loading={loading}
          pagination = {{current:pageNumber}}
          onChange = {this.onChange}
          dataSource = {filterList}
          rowKey = {rowKey}
          columns = {this.columns}
          scroll={{x:1200}}
        />
      </Card>
    );
  }
}

export default PlatformUser;
