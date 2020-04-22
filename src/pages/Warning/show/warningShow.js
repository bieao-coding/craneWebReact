/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import {Tabs,DatePicker,Row,Table,Col,Tag,message} from 'antd';
import moment from "moment/moment";
import {connect} from "dva/index";
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import G2 from '@antv/g2';
const TabPane = Tabs.TabPane;
const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
@connect(({ warning }) => ({
  warning
}))
class WarningShow extends Component{
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
    detailsParams:{
      pageNumber:0,
      pageSize:10,
    },
    tableList:[],
    tableTotal:0,
    tableLoading:false,
    maxHeight:0,
    statisticsData:[],
    rowKey:'index',
    loading:false,
    html:null,
  };
  warningParams = null;
  subAlarmType = {0:formatMessage({ id: 'app.common.collision' }),1:formatMessage({ id: 'app.common.area' }),2:formatMessage({ id: 'app.common.limit' }),3:formatMessage({ id: 'app.common.overLoad' }),4:formatMessage({ id: 'app.common.windSpeed' })};
  type = {overLoad:3,collision:0,limit:2,area:1,windSpeed:4};
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
  columns = [
    {
      title: formatMessage({ id: 'app.statistics.name' }),
      dataIndex: 'name',
      width:300
    },
    {
      title: formatMessage({ id: 'app.statistics.date' }),
      dataIndex: 'date',
      width:150
    },
    {
      title: formatMessage({ id: 'app.statistics.total' }),
      dataIndex: 'total',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.clickNumber({alarmCode:'total',date:record.date,id:record.id})}>{record.total}</a>
        </Fragment>
      ),

    },
    {
      title: formatMessage({ id: 'app.common.overLoad' }),
      dataIndex: 'overLoad',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.clickNumber({alarmCode:'overLoad',date:record.date,id:record.id})}>{record.overLoad}</a>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.common.collision' }),
      dataIndex: 'collision',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.clickNumber({alarmCode:'collision',date:record.date,id:record.id})}>{record.collision}</a>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.common.limit' }),
      dataIndex: 'limit',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.clickNumber({alarmCode:'limit',date:record.date,id:record.id})}>{record.limit}</a>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.common.area' }),
      dataIndex: 'area',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.clickNumber({alarmCode:'area',date:record.date,id:record.id})}>{record.area}</a>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.common.windSpeed' }),
      dataIndex: 'windSpeed',
      align:'center',
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.clickNumber({alarmCode:'windSpeed',date:record.date,id:record.id})}>{record.windSpeed}</a>
        </Fragment>
      ),
    },
  ];
  detailsColumns = [
    {
      title: formatMessage({ id: 'app.common.craneName' }),
      dataIndex: 'craneNumber'
    },
    {
      title: formatMessage({ id: 'app.common.projectName' }),
      dataIndex: 'projectName'
    },
    {
      title: formatMessage({ id: 'app.common.projectName' }),
      dataIndex: 'workCompanyName'
    },
    {
      title: formatMessage({ id: 'app.common.beginTime' }),
      dataIndex: 'recordBeginTime'
    },
    {
      title: formatMessage({ id: 'app.common.endTime' }),
      dataIndex: 'recordEndTime'
    },
    {
      title: formatMessage({ id: 'app.statistics.subAlarmType'}),
      dataIndex: 'subAlarmType',
      render: (text, record) => this.subAlarmType[record.subAlarmType]
    },
    {
      title: formatMessage({ id: 'app.statistics.alarmCode'}),
      dataIndex: 'alarmCode',
      render: (text, record) => this.alarmCode[record.alarmCode]
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
      type: 'warning/getWarning',
      payload:this.state.params,
      callback:(res)=>{
        if(res) {
          this.transformToTree(res);
          this.setState({loading:false,tableList:[],tableTotal:0});
        }
      }
    });
  };
  /*处理成树表格*/
  transformToTree = (data) => {
    const total = [];
    let index = 0;
    const {id} = this.state.params;
    const content = {name:formatMessage({ id: 'app.statistics.total' }),id:id,total: 0, overLoad: 0, collision:0, limit: 0, area: 0, windSpeed: 0,children:[],index:index.toString()};
    data.forEach((item)=>{
      const name = item.name;
      const dateList = item.dateList;
      index++;
      const warningTotal = {
        total:item.total,
        overLoad:item.overLoadTotal,
        collision:item.collisionTotal,
        limit:item.limitTotal,
        area:item.areaTotal,
        windSpeed:item.windSpeedTotal,
        index:index.toString(),
        name:name,
        id:item.id
      };
      content.total += warningTotal.total;
      content.overLoad += warningTotal.overLoad;
      content.collision += warningTotal.collision;
      content.limit += warningTotal.limit;
      content.area += warningTotal.area;
      content.windSpeed += warningTotal.windSpeed;
      warningTotal.children = dateList.map((value)=>{
        index++;
        return {...value,...{index:index.toString(),id:item.id}}
      });
      total.push(warningTotal);
    });
    content.children = total;
    this.chartsData = total;
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
  /*处理图标渲染*/
  renderChart = () => {
    this.chartsData.forEach((item,index)=>{
      if(item.children && item.children.length){
        const newItem = item.children;
        const data = this.transDataToChart(newItem);
        document.getElementById(`chart` + index).innerHTML = '';
        const chart = new G2.Chart({
          container: `chart` + index,
          marginRatio: 0,
          width: this.chartWidth,
          height: 300
        });
        chart.source(data.array);
        chart.scale({
          date: {
            type: "timeCat" // 为属性定义别名
          },
          value:{
            alias:formatMessage({ id: 'app.statistics.warning-number' })
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
    const type = {
      overLoad:formatMessage({ id: 'app.common.overLoad' }),
      colRadius:formatMessage({ id: 'app.common.collisionRadius' }),
      colSlew:formatMessage({ id: 'app.common.collisionSlew' }),
      limitHeight:formatMessage({ id: 'app.common.limitHeight' }),
      limitRadius:formatMessage({ id: 'app.common.limitRadius' }),
      limitSlew:formatMessage({ id: 'app.common.limitSlew' }),
      areaRadius:formatMessage({ id: 'app.common.areaRadius' }),
      areaSlew:formatMessage({ id: 'app.common.areaSlew' }),
      windSpeed:formatMessage({ id: 'app.common.windSpeed' }),
    };
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
      if(Number(key) == 1){
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
  onPageChange = (page, pageSize) =>{
    const obj = {pageNumber:page - 1,pageSize:pageSize};
    this.setState({
      detailsParams:obj
    },()=>{
      this.clickNumber(this.warningParams,1);
    });
  };
  /*点击数字跳转*/
  clickNumber = ({alarmCode,date,id},type) => {
    this.warningParams = {alarmCode,date,id};
    const code = this.type[alarmCode];
    let detailsParams = this.state.detailsParams;
    if(!type) {
      detailsParams = {pageSize:10,pageNumber:0};
      this.setState({detailsParams:detailsParams})
    }
    const {params} = this.state;
    let newparams = {...detailsParams,...{id:id,beginTime:params.beginDate + ' 00:00:00',endTime:params.endDate + ' 23:59:59'}};
    if(code != undefined){
      newparams = {...newparams,...{subAlarmType:code}};
    }
    if(!!date){
      newparams = {...newparams,...{beginTime:date + ' 00:00:00',endTime:date + ' 23:59:59'}}
    }
    this.setState({activeKey:'2',tableLoading:true,tableList:[],tableTotal:0});
    this.props.dispatch({
      type: 'warning/getWarningDetails',
      payload:newparams,
      callback:(res)=>{
        if(res) {
          const newData = res.list.map((item,index)=>{return {...item,...{index:index}}});
          this.setState({tableList:newData,tableTotal:res.total,tableLoading:false});
        }
      }
    });
  };
  render(){
    const {statisticsData,loading,rowKey,html,activeKey,detailsParams,tableList,tableTotal,tableLoading,params}  = this.state;
    const operations = (
      <RangePicker
        allowClear={false}
        format="YYYY-MM-DD"
        value={[moment(params.beginDate, dateFormat), moment(params.endDate, dateFormat)]}
        placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
        disabledDate={this.disabledDate}
        onChange={this.onChange}
      />
    );
    return (
      <Row className='p-l-10' id='content'>
        <Tabs animated={false} tabBarExtraContent={operations} onChange={this.callback} activeKey={activeKey}>
          <TabPane tab = {formatMessage({id:'app.statistics.list'})} key= '0'>
            <Table
              rowKey = {rowKey}
              dataSource={statisticsData}
              columns={this.columns}
              loading={loading}
              defaultExpandedRowKeys = {['0']}
              scroll = {{x:1050}}
            />
          </TabPane>
          <TabPane tab = {formatMessage({id:'app.statistics.char'})} key= '1'>
            <Row type='flex' justify='space-between'>
              {html}
            </Row>
          </TabPane>
          <TabPane tab = {formatMessage({id:'app.statistics.description'})} key= '2'>
            <CommonTable
              loading={tableLoading}
              list = {tableList}
              rowKey = 'index'
              columns = {this.detailsColumns}
              total = {tableTotal}
              currentPage = {detailsParams.pageNumber + 1}
              pageSize = {detailsParams.pageSize}
              onChange = {this.onPageChange}
            />
          </TabPane>
        </Tabs>
      </Row>
    );
  }
}
export default WarningShow;
