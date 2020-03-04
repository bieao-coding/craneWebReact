/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {Form,Card,Row,Col,Button,Input,Tag,Divider,Icon} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {transCraneData} from '@/utils/utils';
import CommonTable from '@/components/CommonTable';
import styles from './crane.less'
import info from '@/defaultInfo';
@connect(({ crane,user, loading }) => ({
  crane,
  auth:user.authorization,
  loading: loading.effects['crane/getCranes'],
}))
class Crane extends Component {
  state = {
    list:[],
    total:0,
    params:{
      projectId:null,
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'index',
    placeHolder:formatMessage({id:'app.crane.number-sn'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (!(index%2)) {
          obj.props.rowSpan = 2;
        }
        if(index%2){
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: 'SN',
      dataIndex: 'sn',
      render:(text,record,index)=>{
        if(!(index%2)){
          return <Fragment>
            <i className = {record.online ? 'iconfont icon-anti online-color':'iconfont icon-anti offline-color'}/>
            <span className='m-l-10'>{record.sn}</span>
          </Fragment>
        }else{
          return <Fragment>
            <i className = {record.online ? 'iconfont icon-video online-color':'iconfont icon-video offline-color'}/>
            <span className='m-l-10'>{record.sn}</span>
          </Fragment>;
        }
      }
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'online',
      align:'center',
      render:(text,record)=>{
        return <i className = {record.online ? 'iconfont icon-signal online-color':'iconfont icon-signal offline-color'}/>;
      }
    },
    {
      title: formatMessage({id:'app.crane.craneAlias'}),
      dataIndex: 'craneAlias',
      align:'center',
      render: (value, record, index) => {
        const obj = {
          children:
            <Fragment>
              {!!record.craneAlias ? (
                <Tag color='green'>{record.craneAlias}</Tag>
              ):(<Fragment></Fragment>)}
            </Fragment>,
          props: {},
        };
        if (!(index%2)) {
          obj.props.rowSpan = 2;
        }
        if(index%2){
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: formatMessage({id:'app.common.craneType'}),
      dataIndex: 'craneType',
      align:'center',
      render: (value, record, index) => {
        const obj = {
          children:
            <Fragment>
              <Tag color={!record.craneType ? 'green' : ((record.craneType === 1) ? 'blue':'orange')}>{!record.craneType ? formatMessage({id:'app.common.flat-crane'}) : ((record.craneType === 1) ? formatMessage({id:'app.common.movable-crane'}):formatMessage({id:'app.common.head-crane'}))}</Tag>
            </Fragment>,
          props: {},
        };
        if (!(index%2)) {
          obj.props.rowSpan = 2;
        }
        if(index%2){
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (value, record, index) => {
        const obj = {
          children:
            <Fragment>
              {this.props.auth.crane_edit ? (
                <Fragment>
                  <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.addAndEdit(1,record)}>
                    <FormattedMessage id='app.common.edit' />
                  </a>
                </Fragment>
              ):(<Fragment></Fragment>)}
              {this.props.auth.crane_operator ? (
                <Fragment>
                <span className={[styles.showCount,'m-r-10'].join(' ')}>
                  <a href = 'javascript:void(0)' onClick={() => this.bindOperator(record)}>
                    <FormattedMessage id='app.crane.bindOperator' />
                  </a>
                  <span className={styles.count}>{!!record.workerCount ? record.workerCount : 0}</span>
                </span>
                </Fragment>
              ):(<Fragment></Fragment>)}
              {this.props.auth.crane_cardRecord ? (
                <Fragment>
                  <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.getRecord(record)}>
                    <FormattedMessage id='app.crane.cardRecord' />
                  </a>
                </Fragment>
              ):(<Fragment></Fragment>)}
              {this.props.auth.crane_nvr ? (
                <Fragment>
                  <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.bindNvr(record)}>
                    <FormattedMessage id='app.crane.bindNVR' />
                  </a>
                </Fragment>
              ):(<Fragment></Fragment>)}
              {this.props.auth.crane_bindRecord ? (
                <Fragment>
                  <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.bindRecord(record)}>
                    <FormattedMessage id='app.common.bindRecord' />
                  </a>
                </Fragment>
              ):(<Fragment></Fragment>)}
              {this.props.auth.crane_bindContact ? (
                <Fragment>
                  <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.bindContact(record)}>
                    <FormattedMessage id='app.crane.bindContact' />
                  </a>
                </Fragment>
              ):(<Fragment></Fragment>)}
              {this.props.auth.crane_ext ? (
                <a href = 'javascript:void(0)' onClick={() => this.addAndEdit(2,record)}>
                  <FormattedMessage id='app.common.ext' />
                </a>
              ):(<Fragment></Fragment>)}
            </Fragment>
          ,
          props: {},
        };
        if (!(index%2)) {
          obj.props.rowSpan = 2;
        }
        if(index%2){
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({params:{...this.state.params,...{projectId:location.projectId}}},()=>{
        this.getList();
      })
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(currentState && nextState.projectId !== currentState.projectId){
      this.setState({params:{projectId:nextState.projectId,search:'',pageNumber:0,pageSize:10}},()=>{
        this.getList();
      })
    }
  }

  /*请求事件*/
  getList = () => {
    const { dispatch,crane } = this.props;
    const {projectId} = this.state.params;
    const {pageNumber = 0, pageSize = 10} = (crane.pageObj)[projectId] || {};
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'crane/getCranes',
      payload:params,
      callback:(res)=>{
        const list = transCraneData(res.list, ['craneId', 'craneNumber','craneType','workerCount','craneAlias'], [['sn', 'online'], ['videoSn', 'videoOnline']])
        const newList = list.map((value,index)=>{
          return Object.assign(value,{index:index})
        });
        this.setState({list:newList,total:res.total});
      }
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    const {pageObj} = this.props.crane;
    const {projectId} = this.state.params;
    pageObj[projectId] = {pageNumber:page - 1,pageSize};
    this.props.dispatch({
      type: 'crane/setPage',
      payload:{pageObj}
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
    const {pageObj} = this.props.crane;
    const {projectId,pageSize} = this.state.params;
    pageObj[projectId] = {pageNumber:0,pageSize};
    this.props.dispatch({
      type: 'crane/setPage',
      payload:{pageObj}
    });
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    });
  };
  /*新增*/
  addAndEdit = (type,record) => {
    const {projectId} = this.state.params;
    if(!projectId) return;
    const obj = {};
    obj.projectId = projectId;
    if(type) obj.craneId = record.craneId;
    router.push({
      pathname:type ? (type === 1 ? '/crane/craneLayout/crane/edit' : '/crane/craneLayout/crane/ext') : '/crane/craneLayout/crane/add',
      state:obj
    });
  };
  /*获取打卡记录*/
  getRecord = (record) => {
    if(!record || !record.craneId) return;
    router.push({
      pathname:'/crane/craneLayout/crane/cardRecord',
      state:{craneId:record.craneId}
    });
  };
  /*绑定nvr*/
  bindNvr = (record) => {
    if(!record || !record.craneId) return;
    router.push({
      pathname:'/crane/craneLayout/crane/nvr',
      state:{craneId:record.craneId}
    });
  };
  /*绑定塔机司机*/
  bindOperator = (record) => {
    if(!record || !record.craneId) return;
    router.push({
      pathname:'/crane/craneLayout/crane/operator',
      state:{craneId:record.craneId}
    });
  };
  /*查看绑定记录*/
  bindRecord = (record) => {
    if(!record || !record.craneId) return;
    router.push({
      pathname:'/crane/craneLayout/crane/bindRecord',
      state:{craneId:record.craneId}
    });
  };
  /*绑定联系人*/
  bindContact = (record) => {
    if(!record || !record.craneId) return;
    const params = {craneId:record.craneId,projectId:this.state.params.projectId,addList:[],copyList:[]};
    this.props.dispatch({
      type: 'crane/modifySelect',
      payload: params
    });
    router.push({
      pathname:'/crane/craneLayout/crane/bindContact/table',
      state:params
    });
  };
  render() {
    const {loading} = this.props;
    const {placeHolder,rowKey,params,list,total} = this.state;
    return (
      <div className={[styles.expandTable,'p-l-10'].join(' ')} id='content'>
        <Form onSubmit={this.search} layout="inline">
          <Row gutter={8} className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} value={params.search} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16} className='flex space-between'>
              <Button type="primary" icon="search" htmlType="submit">
                <FormattedMessage id='app.common.search'/>
              </Button>
              {this.props.auth.crane_add ? (
                <Button type="primary" icon="plus" onClick={()=>this.addAndEdit(0)}>
                  <FormattedMessage id='app.common.add'/>
                </Button>
              ):(<Fragment></Fragment>)}
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
          scroll={{x:930}}
        />
      </div>
    );
  }
}

export default Crane;
