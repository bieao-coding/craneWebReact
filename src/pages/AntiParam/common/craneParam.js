/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {Form,Card,Row,Col,Button,Input,Tag,Table,Divider,Icon} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {transCraneData} from '@/utils/utils';
import CommonTable from '@/components/CommonTable';
import $ from "jquery";
import info from '@/defaultInfo';
@connect(({ antiParam,user, loading }) => ({
  antiParam,
  auth:user.authorization,
  loading: loading.effects['antiParam/getCranes'],
}))
class CraneParam extends Component {
  state = {
    list:[],
    orgList:[],
    title:'',
    params:{
      projectId:null,
      queryType:1
    },
    rowKey:'index',
    placeHolder:formatMessage({id:'app.crane.number-sn'}),
    auth:{}
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      width:200,
    },
    {
      title: 'SN',
      dataIndex: 'sn',
      width:200,
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'online',
      align:'center',
      width:200,
      render:(text,record)=>{
        return <i className = {record.online ? 'iconfont icon-signal online-color':'iconfont icon-signal offline-color'}/>;
      }
    },
    {
      title: formatMessage({id:'app.common.craneType'}),
      dataIndex: 'craneType',
      align:'center',
      width:200,
      render: (value, record) => (
        <Fragment>
          <Tag color={!record.craneType ? 'green' : ((record.craneType === 1) ? 'blue':'orange')}>{!record.craneType ? formatMessage({id:'app.common.flat-crane'}) : ((record.craneType === 1) ? formatMessage({id:'app.common.movable-crane'}):formatMessage({id:'app.common.head-crane'}))}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.options'}),
      width:200,
      render: (value, record) => (
        <Fragment>
          {this.props.auth.param ? (
            <a onClick={() => this.setParams(record)}>
              <FormattedMessage id='app.common.set' />
            </a>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.setState({maxHeight:document.getElementById('content').offsetHeight});
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({title:location.title,params:{...this.state.params,...{projectId:location.projectId}}},()=>{
        this.getList();
      })
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.projectId !== currentState.projectId){
      this.setState({title:nextState.title,params:{projectId:nextState.projectId}},()=>{
        this.getList();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,antiParam } = this.props;
    const {projectId} = this.state.params;
    const {pageNumber = 0, pageSize = 10} = (antiParam.pageObj)[projectId] || {};
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'antiParam/getCranes',
      payload:params,
      callback:(res)=>{
        const newList = res.list.map((value,index)=>{
          return Object.assign(value,{index:index})
        });
        this.setState({list:newList,orgList:newList});
      }
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    const value = e.target.value;
    const {orgList} = this.state;
    let newList = orgList;
    if(!!value){
      newList = orgList.filter((item)=>!!item.sn && item.sn.indexOf(value) > -1 || item.craneNumber.indexOf(value) > -1);
    }
    this.setState({list:newList});
  };
  /*设置参数*/
  setParams = (record) => {
    if(!record.craneId) return;
    if(parseInt($('#turn-left-right').css('left').match(/\d+/)[0])) {
      $('#turn-left-right').click();
    }
    router.push({
      pathname:'/device/anti/param/layout/crane/set/craneStructure',
      state:{title:this.state.title + ` > ${record.craneNumber}`,id:record.craneId,list:this.state.list}
    });
  };
  render() {
    const {loading} = this.props;
    const {placeHolder,rowKey,list} = this.state;
    return (
      <div className='p-l-10' id='content'>
        <Form layout="inline">
          <Row className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
          </Row>
        </Form>
        <Table
          loading={loading}
          dataSource = {list}
          rowKey = {rowKey}
          columns = {this.columns}
        />
      </div>
    );
  }
}

export default CraneParam;
