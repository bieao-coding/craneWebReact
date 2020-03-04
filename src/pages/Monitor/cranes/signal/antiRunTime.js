/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {transSecondsToFormat} from '@/utils/utils'
import {Form,Card,Row,Col,Button,Input,DatePicker,Select,message,Icon} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import styles from './antiRunTime.less'
const { RangePicker } = DatePicker;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';
@connect(({ monitor,treeAllSelect, loading }) => ({
  monitor,
  defaultCraneId:treeAllSelect.defaultCraneId,
  loading: loading.effects['monitor/getAntiRunTimeLog'],
}))
class AntiRunTime extends Component {
  state = {
    list:[],
    total:0,
    cranes:[],
    currentData:{recordTime:formatMessage({id:'app.monitor.nothing'}),runSeconds:0},
    params:{
      craneId:null,
      beginTime:moment().format(dateFormat),
      endTime:moment().format(dateFormat),
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'index',
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.monitor.open-time'}),
      dataIndex: 'recordTime',
      width:200
    },
    {
      title: formatMessage({id:'app.monitor.close-time'}),
      dataIndex: 'endTime',
      align:'center',
      width:200,
      render: (text, record) => (
        !!record.endTime ? record.endTime : '--'
      ),
    },
    {
      title: formatMessage({id:'app.monitor.run-time'}),
      dataIndex: 'runSeconds',
      align:'center',
      width:300,
      render: (text, record) => (
        transSecondsToFormat(record.runSeconds)
      ),
    },
  ];
  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({projectId:location.projectId},()=>{
        this.getCranes(location.projectId);
      })
    }
  }
  // /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.setState({projectId:nextState.projectId},()=>{
        this.getCranes(nextState.projectId);
      })
    }
  }
  /*请求塔机列表*/
  getCranes(projectId){
    const { dispatch } = this.props;
    const defaultCraneId = this.props.defaultCraneId;
    dispatch({
      type: 'monitor/getCranes',
      payload:{queryType:1,projectId:projectId},
      callback:(res)=>{
        const cranes = res.list;
        if(!cranes.length){
          this.setState({cranes:[],list:[],total:0,params:{...this.state.params,...{craneId:null}}});
          return;
        };
        const newCranes = cranes.map((item) => {
          return <Option value={item.craneId} key={item.craneId}>{item.craneNumber}</Option>
        });
        this.setState({cranes: newCranes},()=>{
          let selectId = null;
          if(defaultCraneId && cranes.some((item)=>item.craneId === defaultCraneId)){
            selectId = defaultCraneId
          }else{
            selectId = cranes[0].craneId;
          }
          this.setState({params:{...this.state.params,...{craneId:selectId}}},()=>{
            this.handleChange(this.state.params.craneId);
            this.getRunTimeTotal();
            this.getList();
          })
          this.props.dispatch({
            type: 'treeAllSelect/modifySelect',
            payload: {defaultCraneId:selectId}
          });
        });
      }
    });
  }
  /*请求事件*/
  getRunTimeTotal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getAntiRunTime',
      payload:this.state.params.craneId,
      callback:(res)=>{
        if(res && res[0]){
          this.setState({currentData:res[0]})
        }

      }
    });
  };
  /*请求事件*/
  getList = () => {
    if(!this.state.params.craneId) return;
    const { dispatch } = this.props;
    const {params} = this.state;
    dispatch({
      type: 'monitor/getAntiRunTimeLog',
      payload:{...params,...{beginTime:params.beginTime + ' 00:00:00',endTime:params.endTime + ' 23:59:59'}},
      callback:(res)=>{
        const newRes = res.list.map((item,index)=>{
          return {...item,...{index:index}}
        });
        this.setState({list:newRes,total:res.total})
      }
    });
  };
  /*查询*/
  search = () => {
    const {beginTime,endTime} = this.state.params;
    if(moment(endTime).diff(moment(beginTime),'d') >= 7){
      message.error(formatMessage({id:'app.monitor.less-than-sevenDay'}));
      return;
    }
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getRunTimeTotal();
      this.getList();
    })
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
  /*禁止日期*/
  disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };
  /*时间的变化*/
  onChange = (value, dateString) => {
    this.setState({params:{...this.state.params,...{beginTime:dateString[0],endTime:dateString[1]}}});
  };
  /*选择*/
  handleChange = (value) => {
    this.setState({params:{...this.state.params,...{craneId:value}}});
    this.props.dispatch({
      type: 'treeAllSelect/modifySelect',
      payload: {defaultCraneId:value}
    });
  };
  render() {
    const {rowKey,params,cranes,list,total,currentData} = this.state;
    const {loading} = this.props;
    return (
      <div className={['all-height',styles.runTime].join(' ')} id='item'>
        <Form layout="inline">
          <Row type= 'flex'>
            <Select onChange={this.handleChange} value = {params.craneId} className = 'm-b-10'  style={{ width: 80 }}>{cranes}</Select>
            <RangePicker
              allowClear={false}
              format="YYYY-MM-DD"
              defaultValue={[moment(params.beginTime, dateFormat), moment(params.endTime, dateFormat)]}
              placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
              disabledDate={this.disabledDate}
              onChange={this.onChange}
              className = 'm-l-10 m-b-10'
            />
            <Button disabled={!params.beginTime || !params.endTime} type="primary" icon="search" className='m-l-10 m-b-10' onClick={this.search}>
              <FormattedMessage id='app.common.search' />
            </Button>
          </Row>
        </Form>
        <Row className={styles.lastData}>
          <i className={['iconfont icon-signal icon-tongzhi',styles.notification].join(' ')}/>
          <span className={styles.beginTime}>{formatMessage({id:'app.monitor.beginTime'})}：{currentData.recordTime}</span>
          <span>{formatMessage({id:'app.monitor.runSeconds'})}：{transSecondsToFormat(currentData.runSeconds)}</span>
        </Row>
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

export default AntiRunTime;
