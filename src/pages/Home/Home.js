/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {compare} from '@/utils/utils'
import {
  Row,
  Col,
  Tabs,
  Card,
  Icon,
  Tooltip,
} from 'antd';
import {
  ChartCard,
  Field,
  Bar,
  MiniArea,
} from '@/components/Charts';
import Trend from '@/components/Trend';
import numeral from 'numeral';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from './Home.less';
import CommonTable from '@/components/CommonTable';
import G2 from '@antv/g2';
import { formatMessage, FormattedMessage } from 'umi/locale';
import $ from 'jquery'
const { TabPane } = Tabs;
const dateFormat = 'YYYY-MM-DD';
@connect(({home,user}) => ({
  home,
  currentUser:user.currentUser,
}))
class Home extends Component {
  state = {
    loading:false,
    tableParams:{
      pageNumber:0,
      pageSize:10,
    },
    topData:{
      warning:{total:0,rate:0,list:[]},
      alarm:{total:0,rate:0,list:[]},
      peccancy:{total:0,rate:0,list:[]},
      craneCount:{total:0,current:0,rate:0,list:[]}
    },
    centerData:{
      centerList:[]
    },
    bottomData:{
      tableList:[],
      tableTotal:0
    },
    tableList:[],
    total:0,
  };
  types = {
    overLoad:formatMessage({ id: 'app.common.overLoad' }),
    collision:formatMessage({ id: 'app.common.collision' }),
    limit:formatMessage({ id: 'app.common.limit' }),
    area:formatMessage({ id: 'app.common.area' }),
    windSpeed:formatMessage({ id: 'app.common.windSpeed' }),
  };
  bottomRequest = {1:'getWarningDetails',2:'getAlarmDetails',3:'getPeccancyDetails'};
  active = 'today';
  userInfo = {};
  topParams = {beginDate:moment().subtract(6,'d').format(dateFormat),endDate:moment().format(dateFormat),hasDateList:1};
  centerParams = {beginDate:moment().format(dateFormat),endDate:moment().format(dateFormat),hasDateList:1};
  bottomParams = {beginTime:moment().format(dateFormat) + ' 00:00:00',endTime:moment().format('YYYY-MM-DD HH:mm:ss')};
  centerCurrentKey = 1;
  bottomCurrentKey = 1;
  subAlarmType = {0:formatMessage({ id: 'app.common.collision' }),1:formatMessage({ id: 'app.common.area' }),2:formatMessage({ id: 'app.common.limit' }),3:formatMessage({ id: 'app.common.overLoad' }),4:formatMessage({ id: 'app.common.windSpeed' })};
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
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.addEvens();
    this.getTop();
    this.callback(this.centerCurrentKey);
    this.changeTab(1);
  }
  /*浏览器大小更改事件*/
  addEvens(){
    const self = this;
    window.onresize = function(){
      const keys = ['warningChart','alarmChart','peccancyChart'];
      const current = keys[self.centerCurrentKey - 1];
      const width = $(`#${current}`).width();
      if(self[current]) self[current].changeWidth(width)
    }
  }
  /*处理顶部数据*/
  getTop(){
    this.props.dispatch({
      type: 'home/getTop',
      payload: this.topParams,
      callback:(res)=>{
        if(res) {
          this.transformTop(res);
        }
      }
    });
  }
  transformTop = (data) => {
    const topTotal = {
      warning:{total:0,rate:0,list:[]},
      alarm:{total:0,rate:0,list:[]},
      peccancy:{total:0,rate:0,list:[]},
      craneCount:{total:0,current:0,rate:0,list:[]}
    };
    Object.keys(data).forEach((item,index)=>{
      const obj = data[item];
      const dateList = obj.dateList;
      const len = dateList.length;
      if(index === 3){
        const currentDeviceOnlineCount = dateList[len - 1].currentDeviceOnlineCount;
        const total = dateList[len - 1].totalDeviceCount;
        const rate = !total ?  0 : Math.round(currentDeviceOnlineCount/total * 100);
        const barData = dateList.map((item)=>{
          return {x:item.date,y:item.todayDeviceOnlineCount}
        });
        if(topTotal[item]){
          topTotal[item].total = total;
          topTotal[item].current = currentDeviceOnlineCount;
          topTotal[item].rate = rate;
          topTotal[item].list = barData;
        }
      }else{
        const lastTotal = dateList[len - 1].total;
        const beforeLastDay = dateList[len - 2].total;
        const rate = !beforeLastDay ?  lastTotal * 100 : Math.round((lastTotal - beforeLastDay)/beforeLastDay * 100);
        const barData = dateList.map((item)=>{
          return {x:item.date,y:item.total}
        });
        if(topTotal[item]){
          topTotal[item].total = lastTotal;
          topTotal[item].rate = rate;
          topTotal[item].list = barData;
        }
      }
    });
    this.setState({topData:topTotal});
  };


  /*处理中部数据*/
  isActive(type) {
    return type === this.active ? styles.currentDate : '';
  }
  selectDate = type => {
    let beginDate = moment();
    const endDate = moment();
    switch(type){
      case 'today':
        beginDate = endDate;
        break;
      case 'week':
        beginDate = endDate.subtract(6,'d');
        break;
      case 'twoWeek':
        beginDate = endDate.subtract(13,'d');
        break;
      case 'month':
        beginDate = endDate.subtract(29,'d');
        break;
    };
    this.active = type;
    Object.assign(this.centerParams,{beginDate:beginDate.format(dateFormat),endDate:moment().format(dateFormat)});
    this.callback(this.centerCurrentKey);
  };
  callback = (value) =>{
    this.setState({centerData:{centerBar:[],centerList:[]}});
    const key = Number(value);
    this.centerCurrentKey = key;
    let type = null;
    switch(key){
      case 1:
        type = 'home/getCenterWarning';
        break;
      case 2:
        type = 'home/getCenterAlarm';
        break;
      case 3:
        type = 'home/getCenterPeccancy';
        break;
    }
    this.getCenter(type);
  };
  getCenter = (type) => {
    this.props.dispatch({
      type: type,
      payload: {...this.centerParams,...{userId:this.props.currentUser.userId}},
      callback:(res)=>{
        if(res) {
          this.transformCenter(res)
        }
      }
    });
  };
  transformCenter = (data) => {
    const centerData = {centerList:[]};
    const centerBar = [];
    const type = {
      overLoad:formatMessage({ id: 'app.common.overLoad' }),
      collisionRadius:formatMessage({ id: 'app.common.collisionRadius' }),
      collisionSlew:formatMessage({ id: 'app.common.collisionSlew' }),
      limitHeight:formatMessage({ id: 'app.common.limitHeight' }),
      limitRadius:formatMessage({ id: 'app.common.limitRadius' }),
      limitSlew:formatMessage({ id: 'app.common.limitSlew' }),
      areaRadius:formatMessage({ id: 'app.common.areaRadius' }),
      areaSlew:formatMessage({ id: 'app.common.areaSlew' }),
      windSpeed:formatMessage({ id: 'app.common.windSpeed' }),
    };
    const dateValues = {};
    data.forEach((item)=>{
      const name = item.name;
      const dateList = item.dateList;
      dateList.forEach((it)=>{
        if(!dateValues[it.date]){
          dateValues[it.date] = {overLoad:0,collisionRadius:0,collisionSlew:0,limitHeight:0,limitRadius:0,limitSlew:0,areaRadius:0,areaSlew:0,windSpeed:0};
        }
        dateValues[it.date].overLoad += it.overLoad;
        dateValues[it.date].collisionRadius += it.colRadius;
        dateValues[it.date].collisionSlew += it.colSlew;
        dateValues[it.date].limitHeight += it.limitHeight;
        dateValues[it.date].limitRadius += it.limitRadius;
        dateValues[it.date].limitSlew += it.limitSlew;
        dateValues[it.date].areaRadius += it.areaRadius;
        dateValues[it.date].areaSlew += it.areaSlew;
        dateValues[it.date].windSpeed += it.windSpeed;
      });
      centerData.centerList.push({
        title:name,
        total:item.total
      });
    });
    for(const key in dateValues){
      for(const item in type){
        centerBar.push({
          name:type[item],
          date:key,
          value:dateValues[key][item]
        });
      }
    }
    centerData.centerList = centerData.centerList.sort(compare('total',1));
    this.setState({centerData:centerData});
    this.drawChart(centerBar);
  };
  drawChart(data){
    switch(this.centerCurrentKey){
      case 1:
        $('#warningChart').empty();
        this.warningChart = new G2.Chart({
          container: 'warningChart',
          padding: 'auto',
          width: $('#warningChart').width(),
          height: 295,
        });
        this.warningChart.legend(false);
        this.warningChart.scale({
          date: {
            type: "timeCat", // 为属性定义别名
          }
        });
        if(this.active == 'today'){
          this.warningChart.interval().position('date*value').color('name').opacity(1).adjust([{
            type: 'dodge',
          }]);
        }else{
          this.warningChart.line().position('date*value').color('name');
        }
        this.warningChart.source(data);
        this.warningChart.render();
        break;
      case 2:
        $('#alarmChart').empty();
        this.alarmChart = new G2.Chart({
          container: 'alarmChart',
          padding: 'auto',
          width: $('#alarmChart').width(),
          height: 295,
        });
        this.alarmChart.scale({
          date: {
            type: "timeCat", // 为属性定义别名
          }
        });
        this.alarmChart.legend(false);
        if(this.active == 'today'){
          this.alarmChart.interval().position('date*value').color('name').opacity(1).adjust([{
            type: 'dodge',
          }]);
        }else{
          this.alarmChart.line().position('date*value').color('name');
        }
        this.alarmChart.source(data);
        this.alarmChart.render();
        break;
      case 3:
        $('#peccancyChart').empty();
        this.peccancyChart = new G2.Chart({
          container: 'peccancyChart',
          padding: 'auto',
          width: $('#peccancyChart').width(),
          height: 295,
        });
        this.peccancyChart.scale({
          date: {
            type: "timeCat", // 为属性定义别名
          }
        });
        this.peccancyChart.legend(false);
        if(this.active == 'today'){
          this.peccancyChart.interval().position('date*value').color('name').opacity(1).adjust([{
            type: 'dodge',
          }]);
        }else{
          this.peccancyChart.line().position('date*value').color('name');
        }
        this.peccancyChart.source(data);
        this.peccancyChart.render();
        break;
    }
  }

  /*底部数据*/
  changeTab = (value) => {
    const key = Number(value);
    this.bottomCurrentKey = key;
    this.setState({tableParams:{pageNumber:0,pageSize:10}},()=>{
      this.getBottom();
    })
  };
  onPageChange = (page, pageSize) =>{
    const obj = {pageNumber:page - 1,pageSize:pageSize};
    this.setState({
      tableParams:obj
    },()=>{
      this.getBottom();
    });
  };
  getBottom(){
    const {tableParams} = this.state;
    this.props.dispatch({
      type: `home/${this.bottomRequest[this.bottomCurrentKey]}`,
      payload: {...tableParams,...{...this.bottomParams,userId:this.props.currentUser.userId}},
      callback:(res)=>{
        if(res) {
          const newData = res.list.map((item,index)=>{return {...item,...{index:index}}});
          this.setState({bottomData:{tableList:newData,tableTotal:res.total}});
        }
      }
    });
  }
  columns = [
    {
      title: formatMessage({ id: 'app.common.craneName' }),
      dataIndex: 'craneNumber'
    },
    {
      title: formatMessage({ id: 'app.common.projectName' }),
      dataIndex: 'projectName'
    },
    {
      title: formatMessage({ id: 'app.common.companyName' }),
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
      title: formatMessage({ id: 'app.home.waring-type' }),
      dataIndex: 'subAlarmType',
      render: (text, record) => this.subAlarmType[record.subAlarmType]
    },
    {
      title: formatMessage({ id: 'app.home.waring-description' }),
      dataIndex: 'alarmCode',
      render: (text, record) => this.alarmCode[record.alarmCode]
    },
  ];
  render() {
    const {topData,centerData,loading,tableParams,bottomData} = this.state;
    const {warning,alarm,peccancy,craneCount} = topData;
    const {centerList} = centerData;
    const {tableList,tableTotal} = bottomData;
    const salesExtra = (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          <a className={this.isActive('today')} onClick={() => this.selectDate('today')}>
            <FormattedMessage id="app.home.today"/>
          </a>
          <a className={this.isActive('week')} onClick={() => this.selectDate('week')}>
            <FormattedMessage id="app.home.seven-days"/>
          </a>
          <a className={this.isActive('twoWeek')} onClick={() => this.selectDate('twoWeek')}>
            <FormattedMessage id="app.home.fourteen-days"/>
          </a>
          <a className={this.isActive('month')} onClick={() => this.selectDate('month')}>
            <FormattedMessage id="app.home.thirty-days"/>
          </a>
        </div>
      </div>
    );
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 6,
      style: { marginBottom: 24 },
    };
    return (
      <GridContent>
        <Row gutter={24}>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              title={<FormattedMessage
                id="app.home.today-warning"/>}
              total={numeral(warning.total).format('0,0')}
              footer={
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <Trend flag={warning.rate > 0 ? 'up' : 'down'}>
                    <FormattedMessage id='app.home.Heliocentric-ratio'/>
                    <span className={styles.trendText}>{Math.abs(warning.rate)}%</span>
                  </Trend>
                </div>
              }
              contentHeight={46}
            >
              <MiniArea
                line
                height={45}
                data={warning.list}
              />
            </ChartCard>
          </Col>

          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              title={<FormattedMessage
                id="app.home.today-alarm"/>}
              total={numeral(alarm.total).format('0,0')}
              footer={
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <Trend flag={alarm.rate > 0 ? 'up' : 'down'}>
                    <FormattedMessage id='app.home.Heliocentric-ratio'/>
                    <span className={styles.trendText}>{Math.abs(alarm.rate)}%</span>
                  </Trend>
                </div>
              }
              contentHeight={46}
            >
              <MiniArea
                line
                height={45}
                data={alarm.list}
              />
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              title={<FormattedMessage
                id="app.home.today-pccancy"/>}
              total={numeral(peccancy.total).format('0,0')}
              footer={
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <Trend flag={peccancy.rate > 0 ? 'up' : 'down'}>
                    <FormattedMessage id='app.home.Heliocentric-ratio'/>
                    <span className={styles.trendText}>{Math.abs(peccancy.rate)}%</span>
                  </Trend>
                </div>
              }
              contentHeight={46}
            >
              <MiniArea
                line
                height={45}
                data={peccancy.list}
              />
            </ChartCard>
          </Col>
          <Col {...topColResponsiveProps}>
            <ChartCard
              bordered={false}
              loading={loading}
              title={<FormattedMessage
                id="app.home.today-online"/>}
              total={craneCount.rate + '%'}
              footer={
                <Field
                  label={<FormattedMessage id='app.home.online-total'/>}
                  value={craneCount.current + '/' + craneCount.total}
                />
              }
              contentHeight={46}
            >
              <MiniArea
                line
                height={45}
                data={craneCount.list}
              />
            </ChartCard>
          </Col>
        </Row>
        <Card loading={loading} bordered={false} bodyStyle={{ padding: 0 }}>
          <div className={styles.salesCard}>
            <Tabs tabBarExtraContent={salesExtra} size="large" tabBarStyle={{ marginBottom: 24 }} onChange={this.callback}>
              <TabPane
                tab={<FormattedMessage id='app.common.warning'/>}
                key="1"
              >
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                      <Col id='warningChart' />
                    </div>
                  </Col>
                  <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesRank}>
                      <h4 className={styles.rankingTitle}>
                        <FormattedMessage id='app.home.quantity-ranking'/>
                      </h4>
                      <ul className={styles.rankingList}>
                        {centerList.map((item, i) => (
                          <li key={item.title}>
                            <span
                              className={`${styles.rankingItemNumber} ${
                                i < 3 ? styles.active : ''
                                }`}
                            >
                              {i + 1}
                            </span>
                            <span className={styles.rankingItemTitle} title={item.title}>
                              {item.title}
                            </span>
                            <span className={styles.rankingItemValue}>
                              {numeral(item.total).format('0,0')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane
                tab={<FormattedMessage id='app.common.alarm'/>}
                key="2"
              >
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                      <Col id='alarmChart' />
                    </div>
                  </Col>
                  <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesRank}>
                      <h4 className={styles.rankingTitle}>
                        <FormattedMessage id='app.home.quantity-ranking'/>
                      </h4>
                      <ul className={styles.rankingList}>
                        {centerList.map((item, i) => (
                          <li key={item.title}>
                            <span
                              className={`${styles.rankingItemNumber} ${
                                i < 3 ? styles.active : ''
                                }`}
                            >
                              {i + 1}
                            </span>
                            <span className={styles.rankingItemTitle} title={item.title}>
                              {item.title}
                            </span>
                            <span>{numeral(item.total).format('0,0')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane
                tab={<FormattedMessage id='app.common.peccancy'/>}
                key="3"
              >
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                      <Col id='peccancyChart' />
                    </div>
                  </Col>
                  <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesRank}>
                      <h4 className={styles.rankingTitle}>
                        <FormattedMessage id='app.home.quantity-ranking'/>
                      </h4>
                      <ul className={styles.rankingList}>
                        {centerList.map((item, i) => (
                          <li key={item.title}>
                            <span
                              className={`${styles.rankingItemNumber} ${
                                i < 3 ? styles.active : ''
                                }`}
                            >
                              {i + 1}
                            </span>
                            <span className={styles.rankingItemTitle} title={item.title}>
                              {item.title}
                            </span>
                            <span>{numeral(item.total).format('0,0')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>
        </Card>
        <Card loading={loading} bordered={false} bodyStyle={{ padding: 0 }} style={{ marginTop: 24 }}>
          <div className={styles.salesCard}>
            <Tabs onChange={this.changeTab} tabBarStyle={{ marginBottom: 0 }}>
              <TabPane
                tab={<FormattedMessage id='app.home.real-time-warning'/>}
                key='1'
              >
                <div style={{padding:20}}>
                  <CommonTable
                    loading={loading}
                    list = {tableList}
                    rowKey = 'index'
                    columns = {this.columns}
                    total = {tableTotal}
                    currentPage = {tableParams.pageNumber + 1}
                    pageSize = {tableParams.pageSize}
                    onChange = {this.onPageChange}
                  />
                </div>
              </TabPane>
              <TabPane
                tab={<FormattedMessage id='app.home.real-time-alarm'/>}
                key="2"
              >
                <div style={{padding:20}}>
                  <CommonTable
                    loading={loading}
                    list = {tableList}
                    rowKey = 'index'
                    columns = {this.columns}
                    total = {tableTotal}
                    currentPage = {tableParams.pageNumber + 1}
                    pageSize = {tableParams.pageSize}
                    onChange = {this.onPageChange}
                  />
                </div>
              </TabPane>
              <TabPane
                tab={<FormattedMessage id='app.home.real-time-peccancy'/>}
                key="3"
              >
                <div style={{padding:20}}>
                  <CommonTable
                    loading={loading}
                    list = {tableList}
                    rowKey = 'index'
                    columns = {this.columns}
                    total = {tableTotal}
                    currentPage = {tableParams.pageNumber + 1}
                    pageSize = {tableParams.pageSize}
                    onChange = {this.onPageChange}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Card>
      </GridContent>
    );
  }
}

export default Home;
