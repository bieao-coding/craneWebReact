/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {showWindGrade} from '@/utils/utils'
import {Form, Card, Row, Col, Button, Input, DatePicker, Select, message, Tag} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import styles from './antiRunRecord.less';
import info from '@/defaultInfo';
const { RangePicker } = DatePicker;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
@connect(({ monitor,treeAllSelect , loading }) => ({
  monitor,
  defaultCraneId:treeAllSelect.defaultCraneId,
  loading: loading.effects['monitor/getRunDataRecord'],
}))
class AntiRunRecord extends Component {
  state = {
    list:[],
    total:0,
    cranes:[],
    params:{
      craneId:null,
      beginTime:moment().subtract(10,'m').format(dateFormat),
      endTime:moment().format(dateFormat),
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'index',
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.monitor.recordTime'}),
      dataIndex: 'recordTime',
      width:200
    },
    {
      title: formatMessage({id:'app.monitor.rotationAngle'}),
      dataIndex: 'rotationAngle',
      align:'center',
      width:100,
      render: (text, record) => (
       record.rotationAngle.toFixed(1)
      ),
    },
    // {
    //   title: formatMessage({id:'app.monitor.directionAngle'}),
    //   dataIndex: 'directionAngle',
    //   align:'center',
    //   width:100,
    //   render: (text, record) => (
    //     record.directionAngle.toFixed(1)
    //   ),
    // },
    {
      title: formatMessage({id:'app.monitor.radius'}),
      dataIndex: 'radius',
      align:'center',
      width:100,
      render: (text, record) => (
        record.radius.toFixed(1)
      ),
    },
    {
      title: formatMessage({id:'app.monitor.height'}),
      dataIndex: 'height',
      align:'center',
      width:100,
      render: (text, record) => (
        record.height.toFixed(1)
      ),
    },
    {
      title: formatMessage({id:'app.monitor.loadValue'}),
      dataIndex: 'loadValue',
      align:'center',
      width:100,
      render: (text, record) => (
        record.loadValue.toFixed(2)
      ),
    },
    {
      title: formatMessage({id:'app.monitor.torquePercent'}),
      dataIndex: 'torquePercent',
      align:'center',
      width:150,
      render: (text, record) => (
        record.torquePercent.toFixed(1)
      ),
    },
    {
      title: formatMessage({id:'app.monitor.safeLoad'}),
      dataIndex: 'safeLoad',
      align:'center',
      width:150,
      render: (text, record) => (
        record.safeLoad.toFixed(1)
      ),
    },
    // {
    //   title: formatMessage({id:'app.monitor.windSpeed'}),
    //   dataIndex: 'windSpeed',
    //   align:'center',
    //   width:100,
    //   render: (text, record) => {
    //     const result = showWindGrade(record.windSpeed);
    //     return <Tag color = {result.color}>{result.message}</Tag>
    //   }
    // },
    {
      title: formatMessage({id:'app.monitor.stringFactor'}),
      dataIndex: 'stringFactor',
      align:'center',
      width:100,
    },
    {
      title: formatMessage({id:'app.common.warning'}),
      dataIndex: 'warning',
      align:'center',
      width:100,
      render: (text, record) => {
        const value = record.warning;
        const newEle = value.map((item,index)=>{
          return <Tag color='orange' className={index ? styles.antiRun : ''}>{item}</Tag>
        });
        return newEle.length ? newEle : '-';
      }
    },
    {
      title: formatMessage({id:'app.common.alarm'}),
      dataIndex: 'alarm',
      align:'center',
      width:100,
      render: (text, record) => {
        const value = record.alarm;
        const newEle = value.map((item,index)=>{
          return <Tag color='magenta' className={index ? styles.antiRun : ''}>{item}</Tag>
        });
        return newEle.length ? newEle : '-';
      }
    },
    {
      title: formatMessage({id:'app.common.peccancy'}),
      dataIndex: 'peccancy',
      align:'center',
      width:100,
      render: (text, record) => {
        const value = record.peccancy;
        const newEle = value.map((item,index)=>{
          return <Tag color='red' className={index ? styles.antiRun : ''}>{item}</Tag>
        });
        return newEle.length ? newEle : '-';
      }
    },
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
  getList = () => {
    if(!this.state.params.craneId) return;
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getRunDataRecord',
      payload:this.state.params,
      callback:(res)=>{
        const list = this.resolveAlarm(res.list);
        const newList = list.map((item,index)=>{
          return {...item,...{index:index}}
        })
        this.setState({list:newList,total:res.total});
      }
    });
  };
  /*处理显示报警内容*/
  resolveAlarm(list){
    const newList = list.map((item)=>{
        const content = this.transformType(item);
        return {...item,...content};
    });
    return newList;
  };
  /*处理报警类型*/
  transformType({warning,alarm,peccancy}){
    const content = {warning:[],alarm:[],peccancy:[]};
    this.array.forEach((item,index)=>{
      warning & item ? content.warning.push(this.alarmCode[index]) : '';
      alarm & item ? content.alarm.push(this.alarmCode[index]) : '';
      peccancy & item ? content.peccancy.push(this.alarmCode[index]) : '';
    });
    return content;
  }
  search = () => {
    const {beginTime,endTime} = this.state.params;
    if(moment(endTime,dateFormat).diff(moment(beginTime,dateFormat),'d') > 0){
      message.error(formatMessage({id:'app.monitor.less-than-onDay'}));
      return;
    }
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
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
  /*下载PDF*/
  downloadPDF = () => {
    const {params} = this.state;
    location.href=`/restful/v2/sgp/pdf/runData/crane/${params.craneId}?beginTime=${params.beginTime}&endTime=${params.endTime}&pageNumber=${params.pageNumber}&pageSize=${params.pageSize}&order=0`
  };
  render() {
    const {rowKey,params,cranes,list,total} = this.state;
    const {loading} = this.props;
    return (
      <div id='item'>
        <Form layout="inline">
          <Row type= 'flex' className='space-between m-b-10'>
            <div>
              <Select onChange={this.handleChange} value = {params.craneId} style={{ width: 80 }}>{cranes}</Select>
              <RangePicker
                allowClear={false}
                defaultValue={[moment(params.beginTime, dateFormat), moment(params.endTime, dateFormat)]}
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
                disabledDate={this.disabledDate}
                onChange={this.onChange}
                className = 'm-l-10'
              />
              <Button disabled={!params.beginTime || !params.endTime} type="primary" icon="search" className='m-l-10' onClick={this.search}>
                <FormattedMessage id='app.common.search' />
              </Button>
            </div>
            {info.isSingapore ? (
              <Button type="primary" icon="download" onClick={this.downloadPDF}>
                <FormattedMessage id='app.monitor.download' />
              </Button>
            ):(<div></div>)}
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
          scroll={{x:1400}}
        />
      </div>
    );
  }
}

export default AntiRunRecord;
