/*eslint-disable*/
import React, {Component,Fragment} from 'react';
import {Tabs,DatePicker,Row,Table,Col,Tag,message} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {Bar} from '@/components/Charts';
import moment from "moment/moment";
import {connect} from "dva/index";
import {compare,transSecondsToFormat} from '@/utils/utils'
import styles from './workTimeShow.less';
import G2 from '@antv/g2';
const TabPane = Tabs.TabPane;
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
@connect(({ workTime }) => ({
  workTime
}))
class WorkTimeShow extends Component{
  chartWidth = 0;
  chartsData = [];
  state = {
    activeKey:'0',
    params:{
      beginDate:moment().subtract(6, 'days').format(dateFormat),
      endDate:moment().format(dateFormat),
      id:null,
      hasDateList:1
    },
    maxHeight:0,
    statisticsData:[],
    rowKey:'index',
    loading:false,
    html:null,
  };
  columns = [
    {
      title: formatMessage({ id: 'app.statistics.name' }),
      dataIndex: 'name',
      width:300
    },
    {
      title: formatMessage({ id: 'app.statistics.date' }),
      dataIndex: 'date',
      width:200
    },
    {
      title: formatMessage({ id: 'app.statistics.runTimeAnti' }),
      dataIndex: 'antiSecondsFormat',
      align:'center',
      width:200
    },
    {
      title: formatMessage({ id: 'app.statistics.runTimeVideo' }),
      dataIndex: 'videoSecondsFormat',
      align:'center',
      width:200
    },
  ];
  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.id !== undefined){
      this.setState({params:{...this.state.params,...{id:location.id,businessType:location.businessType}}},()=>{
        this.getList();
      })
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && (!currentState || nextState.id !== currentState.id)){
      this.setState({activeKey:'0',params:{...this.state.params,...{id:nextState.id,businessType:nextState.businessType}}},()=>{
        this.getList();
      })
    }
  }
  getList = () => {
    this.setState({loading:true});
    this.props.dispatch({
      type: 'workTime/getWorkTime',
      payload:this.state.params,
      callback:(res)=>{
        if(res) {
          this.transformToTree(res);
          this.setState({loading:false});
        }
      }
    });
  };
  /*处理成树表格*/
  transformToTree = (data) => {
    const total = [];
    let antiSeconds = [],videoSeconds = [];
    let index = 0;
    const content = {name:formatMessage({ id: 'app.statistics.total' }),antiSeconds:0,antiSecondsFormat:0,videoSeconds:0,videoSecondsFormat:0,children:[],index:index.toString()};
    data.forEach((item)=>{
      const name = item.name;
      const dateList = item.dateList;
      const antiSecondsTotal = item.antiSecondsTotal;
      const videoSecondsTotal = item.videoSecondsTotal;
      content.antiSeconds += antiSecondsTotal;
      content.videoSeconds += videoSecondsTotal;
      const children = dateList.map((value)=>{
        index++;
        antiSeconds.push({date:value.date,value:value.antiSeconds,orgName:name});
        videoSeconds.push({date:value.date,value:value.videoSeconds,orgName:name});
        return {...value,...{index:index.toString(),antiSecondsFormat:this.transTime(value.antiSeconds),videoSecondsFormat:this.transTime(value.videoSeconds)}}
      });
      index++;
      total.push({index:index.toString(),name:name,antiSeconds:antiSecondsTotal,antiSecondsFormat:this.transTime(antiSecondsTotal),videoSeconds:videoSecondsTotal,videoSecondsFormat:this.transTime(videoSecondsTotal),children:children});
    });
    content.antiSecondsFormat = this.transTime(content.antiSeconds);
    content.videoSecondsFormat = this.transTime(content.videoSeconds);
    content.children = total;
    const newTotal = JSON.parse(JSON.stringify(total));
    newTotal.unshift({name:formatMessage({ id: 'app.statistics.video' }),children:videoSeconds});
    newTotal.unshift({name:formatMessage({ id: 'app.statistics.anti' }),children:antiSeconds});
    this.chartsData = newTotal;
    this.setState({statisticsData:[content]});
    this.resolveHtml(this.chartsData);
  };
  /*处理时间转换*/
  transTime = (time) => {
    return !time ? 0 : transSecondsToFormat(time);
  };
  /*处理chart框*/
  resolveHtml = (data) => {
    const html = [];
    data.forEach((item,index)=>{
      html.push(
        <div key={index}>
          <Tag color="blue">{item.name}</Tag>
          <Col id={'chart' + index} />
        </div>
      );
    });
    this.setState({html:html});
  };
  /*处理总的显示*/
  resolveTotal(data){
    const array = [],dateObj = {};
    data.forEach((item)=>{
      const obj = {};
      dateObj[item.date] = null;
      obj.name = item.orgName;
      obj.date = item.date;
      obj.value = Math.round((item.value/(60 * 60)) * 100)/100;
      array.push(obj);
    });
    return {array:array,isSingle:Object.keys(dateObj).length === 1};
  }
  /*处理图标渲染*/
  renderChart = () => {
    this.chartsData.forEach((item,index)=>{
      if(item.children && item.children.length){
        const newItem = item.children;
        let data = {};
        document.getElementById(`chart` + index).innerHTML = '';
        const chart = new G2.Chart({
          container: `chart` + index,
          marginRatio: 0,
          width: this.chartWidth,
          height: 300
        });
        if(!index || index === 1){
          data = this.resolveTotal(newItem);
          chart.legend(false)
        }else{
          data = this.transDataToChart(newItem);
        }
        chart.source(data.array);
        chart.scale({
          date: {
            type: "timeCat" // 为属性定义别名
          },
          value:{
            alias:formatMessage({ id: 'app.statistics.hours' })
          }
        });
        chart.axis('value', {
          title: {
            textStyle: {
              fontSize: 12, // 文本大小
              textAlign: 'center', // 文本对齐方式
              fill: '#8c8c8c', // 文本颜色
            }
          }
        });
        if(data.isSingle){
          chart.interval().position('date*value').color('name').opacity(1).adjust([{
            type: 'dodge',
          }]);
        }else{
          chart.line().position('date*value').color('name');
        }
        chart.render();
      }
    });
  };
  /*处理生成图表所需数据格式*/
  transDataToChart = (data) => {
    const type = {antiSeconds:formatMessage({ id: 'app.statistics.anti' }),videoSeconds:formatMessage({ id: 'app.statistics.video' })};
    const array = [],dateObj = {};
    for(const key in type){
      data.forEach((item)=>{
        const obj = {};
        dateObj[item.date] = null;
        obj.name = type[key];
        obj.date = item.date;
        obj.value = Math.round((item[key]/(60 * 60)) * 100)/100; // 转换为时
        array.push(obj);
      });
    }
    return {array:array,isSingle:Object.keys(dateObj).length === 1};
  };
  /*tab页的回调*/
  callback = (key) => {
    this.setState({activeKey:key},()=>{
      if(Number(key)){
        this.calcScale();
        this.renderChart();
      }
    });
  };
  /*计算尺寸*/
  calcScale = () => {
    const width = document.getElementById('content').offsetWidth;
    if ((width/2 - 20) > 600) {
      this.chartWidth = width/2 - 20;
    }else{
      this.chartWidth = 600;
    };
  };
  /*时间的变化*/
  onChange = (value, dateString) => {
    if(value[1].diff(value[0],'d') >= 7){
      message.error(formatMessage({ id: 'app.statistics.more-than-sevenDays' }));
      return;
    }
    this.setState({activeKey:'0',params:{...this.state.params,...{beginDate:dateString[0],endDate:dateString[1]}}},()=>{
      this.getList();
    });
  };
  /*禁止日期*/
  disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };
  render(){
    const {statisticsData,loading,rowKey,params,html,activeKey}  = this.state;
    const operations = (
      <RangePicker
        allowClear={false}
        format="YYYY-MM-DD"
        value={[moment(params.beginDate,dateFormat), moment(params.endDate,dateFormat)]}
        placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
        disabledDate={this.disabledDate}
        onChange={this.onChange}
      />
    );
    return (
      <Row className=' p-l-10' id='content'>
        <Tabs animated={false} tabBarExtraContent={operations} onChange={this.callback} activeKey={activeKey}>
          <TabPane tab = {formatMessage({id:'app.statistics.list'})} key= '0'>
            <Table
              className={styles.total}
              rowKey = {rowKey}
              dataSource={statisticsData}
              columns={this.columns}
              loading={loading}
              defaultExpandedRowKeys = {['0']}
              scroll = {{x:900}}
            />
          </TabPane>
          <TabPane tab = {formatMessage({id:'app.statistics.char'})} key= '1'>
            <Row type='flex' justify='space-between'>
              {html}
            </Row>
          </TabPane>
        </Tabs>
      </Row>
    );
  }
}
export default WorkTimeShow;
