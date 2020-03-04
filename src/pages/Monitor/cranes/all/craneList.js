/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Tag} from 'antd';
import {transCraneData} from '@/utils/utils';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './craneList.less';
@connect(({ monitor, loading }) => ({
  monitor,
  loading: loading.effects['monitor/getCranes'],
}))
class CraneLayout extends Component {
  state = {
    list:[],
    total:0,
    params:{
      projectId:null,
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    maxHeight:0,
    rowKey:'index',
    placeHolder:formatMessage({id:'app.crane.number-sn'}),
  };
  loopTimer = null;
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
      title: formatMessage({id:'app.monitor.warning-content'}),
      dataIndex: 'content',
      width:'30%',
      render: (value, record, index) => {
        let newWarning = [],newAlarm = [],newPeccancy = [];
        if(!!record.content){
          const result = this.transformType(record.content);
          newWarning = result.warning.map((item)=>{
            return (<Tag color='orange'>{item}</Tag>)
          });
          newAlarm = result.alarm.map((item)=>{
            return (<Tag color='magenta'>{item}</Tag>)
          });
          newPeccancy = result.peccancy.map((item)=>{
            return (<Tag color='red'>{item}</Tag>)
          });
        }
        const obj = {
          children:
            <Fragment>
              {[...newWarning,...newAlarm,...newPeccancy]}
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
    }
  ];
  alarmCode = {
    0:formatMessage({ id: 'app.common.left-collision' }),
    1:formatMessage({ id: 'app.common.right-collision' }),
    2:formatMessage({ id: 'app.common.radius-out-collision' }),
    3:formatMessage({ id: 'app.common.radius-into-collision' }),
    4:formatMessage({ id: 'app.common.left-area' }),
    5:formatMessage({ id: 'app.common.right-area' }),
    6:formatMessage({ id: 'app.common.radius-out-area' }),
    7:formatMessage({ id: 'app.common.radius-into-area' }),
    8:formatMessage({ id: 'app.common.slew-left-limit' }),
    9:formatMessage({ id: 'app.common.slew-right-limit' }),
    10:formatMessage({ id: 'app.common.radius-out-limit' }),
    11:formatMessage({ id: 'app.common.radius-into-limit' }),
    12:formatMessage({ id: 'app.common.height-up-limit' }),
    13:formatMessage({ id: 'app.common.height-down-limit' }),
    14:formatMessage({ id: 'app.common.force' }),
    15:formatMessage({ id: 'app.common.torque' }),
    16:formatMessage({ id: 'app.common.windSpeed' }),
  };
  array = [1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536];
  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({params:{...this.state.params,...{projectId:location.projectId}}},()=>{
        this.closeRequest();
        this.getList();
        this.timerRequest();
      })
    }
  }
  // /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.setState({params:{projectId:nextState.projectId,search:'', pageNumber:0,pageSize:10,}},()=>{
        this.closeRequest();
        this.getList();
        this.timerRequest();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,monitor } = this.props;
    const {projectId} = this.state.params;
    const {pageNumber = 0, pageSize = 10} = (monitor.pageObj)[projectId] || {};
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'monitor/getCranes',
      payload:params,
      callback:(res)=>{
        const list = transCraneData(res.list, ['craneId', 'craneNumber','craneType','personalCount'], [['sn', 'online'], ['videoSn', 'videoOnline']])
        const newList = list.map((value,index)=>{
          return Object.assign(value,{index:index})
        });
        this.setState({list:newList,total:res.total});
      }
    });
  };
  /*获取实时数据*/
  getRunData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getRunData',
      payload:this.state.params.projectId,
      callback:(res)=>{
        const {list} = this.state;
        const newList = list.map((item)=>{
          let ind = 0;
          if(res.some((re,index)=>{
            if(item.craneId == re.craneId && item.online && !!item.sn){
              ind = index;
              return true;
            }
            return false;
          })){
            item = {...item,...{content:{warning:res[ind].warning,alarm:res[ind].alarm,peccancy:res[ind].peccancy}}}
          }else{
            item = {...item,...{content:null}};
          }
          return item;
        });
        this.setState({list:newList});
      }
    });
  };
  /*定时请求*/
  timerRequest = () => {
    this.loopTimer = setInterval(()=>{
      this.getRunData();
    },2000);
  };
  /*处理报警类型*/
  transformType({warning,alarm,peccancy}){
    const content = {warning:[],alarm:[],peccancy:[]};
    this.array.forEach((item,index)=>{
      if(peccancy & item){
        content.peccancy.push(this.alarmCode[index]);
      }else if(alarm & item){
        content.alarm.push(this.alarmCode[index]);
      }else if(warning & item){
        content.warning.push(this.alarmCode[index]);
      }
    });
    return content;
  }
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    const {pageObj} = this.props.monitor;
    const {projectId} = this.state.params;
    pageObj[projectId] = {pageNumber:page - 1,pageSize};
    this.props.dispatch({
      type: 'monitor/setPage',
      payload:{pageObj}
    })
    this.setState({
      params:obj
    },()=>{
      this.getList();
    });
  };
  /*关闭循环*/
  closeRequest(){
    if(this.loopTimer)  clearInterval(this.loopTimer);
  }
  /*卸载*/
  componentWillUnmount(){
    this.closeRequest();
  };
  render() {
    const {loading} = this.props;
    const {rowKey,params,list,total} = this.state;
    return (
      <div className={styles.expandTable} id='item'>
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
      </div>
    );
  }
}

export default CraneLayout;
