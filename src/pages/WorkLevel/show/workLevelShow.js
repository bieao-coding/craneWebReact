/*eslint-disable*/
import React, {Component,Fragment} from 'react';
import {Tabs,DatePicker,Row,Table,Col,Tag,message} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from "moment/moment";
import {connect} from "dva/index";
import styles from './workLevelShow.less';
import G2 from '@antv/g2';
const TabPane = Tabs.TabPane;
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
@connect(({ workLevel }) => ({
  workLevel
}))
class WorkLevelShow extends Component{
  chartWidth = 0;
  chartsData = [];
  globalHostTimes = [];
  globalLoadTimes = [];
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
      title: formatMessage({ id: 'app.statistics.loadTimes' }),
      dataIndex: 'hostingTimes',
      align:'center',
      width:100
    },
    {
      title: formatMessage({ id: 'app.statistics.overLoadTimes' }),
      dataIndex: 'overloadTimes',
      align:'center',
      width:100
    },
    {
      title: formatMessage({ id: 'app.statistics.loadSpecStatus' }),
      dataIndex: 'loadSpecStatus',
      align:'center',
      width:100,
      render: (value,record,index) => {
        const result = this.resolveStatus(record);
        const obj = {
          children: result,
          props: {},
        };
        return obj;
      }
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
      type: 'workLevel/getWorkLevel',
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
    let hostTimes = [],loadTimes = [];
    let index = 0;
    const content = {name:formatMessage({ id: 'app.statistics.total' }),hostingTimes:0,overloadTimes:0,loadSpecStatus:'',children:[],index:index.toString()};
    data.forEach((item)=>{
      const name = item.name;
      const dateList = item.dateList;
      const hostingTimesTotal = item.hostingTimesTotal;
      const overloadTimesTotal = item.overloadTimesTotal;
      content.hostingTimes += hostingTimesTotal;
      content.overloadTimes += overloadTimesTotal;
      const children = dateList.map((value)=>{
        index++;
        hostTimes.push({date:value.date,value:value.hostingTimes,orgName:name});
        loadTimes.push({date:value.date,value:value.overloadTimes,orgName:name});
        return {...value,...{index:index.toString()}}
      });
      index++;
      total.push({index:index.toString(),name:name,hostingTimes:hostingTimesTotal,overloadTimes:overloadTimesTotal,loadSpecStatus:item.loadSpecStatus,children:children});
    });
    content.children = total;
    const newTotal = JSON.parse(JSON.stringify(total));
    newTotal.unshift({name:formatMessage({ id: 'app.statistics.overLoadTimes' }),children:loadTimes});
    newTotal.unshift({name:formatMessage({ id: 'app.statistics.loadTimes' }),children:hostTimes});
    this.chartsData = newTotal;
    this.setState({statisticsData:[content]});
    this.resolveHtml(this.chartsData);
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
      obj.value = item.value;
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
            alias:formatMessage({ id: 'app.statistics.time' })
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
    const type = {hostingTimes:formatMessage({ id: 'app.statistics.loadTimes' }),overloadTimes:formatMessage({ id: 'app.statistics.overLoadTimes' })};
    const array = [],dateObj = {};
    for(const key in type){
      data.forEach((item)=>{
        const obj = {};
        dateObj[item.date] = null;
        obj.name = type[key];
        obj.date = item.date;
        obj.value = item[key];
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
    }
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
  /*处理载荷状态*/
  resolveStatus = (record) => {
    const obj = {};
    switch(record.loadSpecStatus){
      case 'Q1':
        obj.title = formatMessage({ id: 'app.statistics.first' });
        obj.color = 'green';
        break;
      case 'Q2':
        obj.title = formatMessage({ id: 'app.statistics.two' });
        obj.color = 'cyan';
        break;
      case 'Q3':
        obj.title = formatMessage({ id: 'app.statistics.three' });
        obj.color = 'orange';
        break;
      case 'Q4':
        obj.title = formatMessage({ id: 'app.statistics.four' });
        obj.color = 'red';
        break;
    }
    if(!!obj.title){
      return (<Fragment>
        <Tag color={obj.color}>{obj.title}</Tag>
      </Fragment>)
    }else{
      return (<div></div>)
    }
  }
  ;
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
          <TabPane tab = {formatMessage({id:'app.statistics.char'})}  key= '1'>
            <Row type='flex' justify='space-between'>
              {html}
            </Row>
          </TabPane>
        </Tabs>
      </Row>
    );
  }
}
export default WorkLevelShow;
