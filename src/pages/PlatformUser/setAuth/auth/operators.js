/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input,Table} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {resMessage} from '@/utils/utils'
@connect(({ platformUser, loading }) => ({
  platformUser,
  loading: loading.effects['platformUser/getOperators'],
}))
class Operators extends Component {
  state = {
    userId:null,
    list:[],
    filterList:[],
    selectedRowKeys:[],
    rowKey:'workerId',
    placeHolder:formatMessage({id:"app.operator.workerName"}),
    saveLoading:false
  };
  userInfo = {};
  /*列名*/
  columns = [
    {
      title: formatMessage({id:"app.operator.workerName"}),
      dataIndex: 'workerName',
    },
    {
      title: formatMessage({id:"app.operator.identityNumber"}),
      dataIndex: 'identityNumber',
    },
    {
      title: formatMessage({id:"app.operator.telephone"}),
      dataIndex: 'telephone',
    }
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const local = this.props.location.state;
    if(local){
      this.userInfo = local;
      this.getList();
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'platformUser/getOperators',
      payload:{queryType:1},
      callback:(res)=>{
        this.resolveRequest(res.list)
      }
    });
  };
  /*判断请求分类*/
  resolveRequest(list){
    const {userId,parentUserId,loginUserId} = this.userInfo;
    if(parentUserId !== loginUserId){
      const params = {userId:userId,parentUserId:parentUserId,list:list,type:1};
      this.requestParentSelect(params);
    }else{
      this.requestSelect(userId,list);
    }
  }
  /*请求parentUserId已选资源*/
  requestParentSelect(params){
    const { dispatch } = this.props;
    const {userId,parentUserId,list,type} = params;
    dispatch({
      type: 'platformUser/getSelectOperators',
      payload:type ? parentUserId : userId,
      callback:(res)=>{
        if(type){
          const newList = list.filter((item)=>res.includes(item.workerId));
          this.setState({list:newList,filterList:newList});
          this.requestParentSelect({...params,...{type:0}});
        }else{
          this.setState({selectedRowKeys:res});
        }
      }
    });
  }
  /*请求userId的已选资源*/
  requestSelect(userId,list){
    const { dispatch } = this.props;
    dispatch({
      type: 'platformUser/getSelectOperators',
      payload:userId,
      callback:(res)=>{
        this.setState({list:list,filterList:list,selectedRowKeys:res});
      }
    });
  }
  /*查询值更改*/
  searchChange = (e) =>{
    const value = e.target.value;
    const {list} = this.state;
    const newList = list.filter((item)=>{
      return item.workerName.indexOf(value) !== -1
    });
    this.setState({filterList:newList})
  };
  /*选择变化*/
  changeSelect = (selectedRowKeys) => {
    this.setState({selectedRowKeys:selectedRowKeys});
  };
  save = () => {
    this.setState({saveLoading:true});
    const { dispatch } = this.props;
    const {selectedRowKeys}  =this.state;
    dispatch({
      type: 'platformUser/saveOperators',
      payload:{userId:this.userInfo.userId,list:selectedRowKeys},
      callback:(res)=>{
        resMessage(res);
        this.setState({saveLoading:false});
      }
    });
  };
  render() {
    const {loading} = this.props;
    const {placeHolder,rowKey,selectedRowKeys,filterList,saveLoading} = this.state;
    const rowSelection = {
      selectedRowKeys:selectedRowKeys,
      onChange: this.changeSelect,
    };
    return (
      <div>
        <Form layout="inline" className = 'm-b-10'>
          <Row gutter={{ md:8,sm:8,xs: 8 }}>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="end">
                {!!this.props.location.state ? (
                  <Button type="primary" loading={saveLoading} onClick={() => this.save()}>
                    <FormattedMessage id='app.common.save' />
                  </Button>
                ):(<Fragment></Fragment>)}
              </Row>
            </Col>
          </Row>
        </Form>
        <Table
          loading={loading}
          dataSource = {filterList}
          rowKey = {rowKey}
          rowSelection={rowSelection}
          columns = {this.columns}
        />
      </div>
    );
  }
}

export default Operators;
