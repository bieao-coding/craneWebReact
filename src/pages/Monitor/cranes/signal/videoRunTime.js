/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {transSecondsToFormat} from '@/utils/utils'
import {Form,Card,Row,Col,Button,Input,DatePicker,Select,message} from 'antd';
import CommonTable from '@/components/CommonTable';
import styles from './videoRunTime.less'
import info from '@/defaultInfo';
const { RangePicker } = DatePicker;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';
@connect(({ monitor, loading }) => ({
  monitor,
  loading: loading.effects['monitor/getVideoRunTimeLog'],
}))
class VideoRunTime extends Component {
  state = {
    cranes:[],
    currentData:{},
    list:[],
    total:0,
    params:{
      craneId:null,
      beginTime:null,
      endTime:null,
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'index',
  };
  /*列名*/
  columns = [
    {
      title: '开机时间',
      dataIndex: 'recordTime',
    },
    {
      title: '设备序列号',
      dataIndex: 'sn',
    },
    {
      title: '运行时长',
      dataIndex: 'runSeconds',
      render: (text, record) => (
        transSecondsToFormat(record.runSeconds)
      ),
    },
  ];
  /*DOM加载完成后执行*/
  componentDidMount() {
    const cranes = info.cranes;
    if (cranes.length) {
      const newCranes = cranes.map((item) => {
        return <Option value={item.craneId} key={item.craneId}>{item.craneNumber}</Option>
      })
      this.setState({cranes: newCranes},()=>{
        if(cranes.length) {
          this.setState({params:{...this.state.params,...{craneId:cranes[0].craneId}}},()=>{
            this.handleChange(this.state.params.craneId);
          })
        }
      });
    };
  }
  /*请求事件*/
  getRunTimeTotal = () => {
    if(!this.state.params.craneId) return;
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getVideoRunTime',
      payload:{craneId:this.state.params.craneId},
      callback:(res)=>{
        this.setState({currentData:res});
      }
    });
  };
  /*请求事件*/
  getList = () => {
    if(!this.state.params.craneId) return;
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getVideoRunTimeLog',
      payload:{...this.state.params,...{beginTime:this.state.params.beginTime + ' 00:00:00',endTime:this.state.params.endTime + ' 23:59:59'}},
      callback:(res)=>{
        const newRes = res.list.map((item,index)=>{
          return {...item,...{index:index}}
        })
        this.setState({list:newRes,total:res.total})
      }
    });
  };
  /*查询*/
  search = () => {
    const {beginTime,endTime} = this.state.params;
    if(moment(endTime).diff(moment(beginTime),'d') >= 7){
      message.error('最多只能查7天的数据!');
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
    this.setState({params:{...this.state.params,...{craneId:value}}})
  };
  render() {
    const {rowKey,params,cranes,currentData,list,total} = this.state;
    const {loading} = this.props;
    return (
      <div>
        <Form layout="inline">
          <Row type= 'flex'>
            <Select onChange={this.handleChange} value = {params.craneId} className = 'm-b-10'  style={{ width: 80 }}>{cranes}</Select>
            <RangePicker
              allowClear={false}
              format="YYYY-MM-DD"
              placeholder={['开始时间', '结束时间']}
              disabledDate={this.disabledDate}
              onChange={this.onChange}
              className = 'm-l-10 m-b-10'
            />
            <Button disabled={!params.beginTime || !params.endTime} type="primary" icon="search" className='m-l-10 m-b-10' onClick={this.search}>
              查询
            </Button>
          </Row>
        </Form>
        <Row type='flex' className={styles.title}>
          <span className='m-r-20'>最新信息：</span>
          <span className={currentData.recordTime ? 'show' : 'hide'}>
            <span>开机时间：{currentData.recordTime}</span>
            <span className='m-l-10'>开始时长：{transSecondsToFormat(currentData.runSeconds)}</span>
            <span className='m-l-10'>总计：{transSecondsToFormat(currentData.runSeconds)}</span>
          </span>
          <span className={currentData.recordTime ? 'hide' : 'show'}>
            无
          </span>
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

export default VideoRunTime;
