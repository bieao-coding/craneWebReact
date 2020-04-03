/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { message, Tabs, Card, Row, Col, Button, Select, DatePicker, Skeleton, Table,Tag } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {transSecondsToFormat} from '@/utils/utils'
import styles from './AnalyseOnline.less';
import moment from 'moment';
import CommonDrawer from '@/components/CommonDrawer';
import CommonGantt from '@/components/CommonGantt';
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const dateFormatTwo = 'YYYY-MM-DD HH:mm:ss';
const { Option } = Select;

@connect(({ analyseOnline, user, loading }) => ({
  analyseOnline,
  auth: user.authorization,
  currentUser: user.currentUser,
  loading: loading.effects['analyseOnline/getAnalyse'],
}))
class AnalyseOnline extends React.Component {
  state = {
    loading:false,
    allSn: [], // 除去已选择的所有sn
    filterSn:[], // 过滤后的sn
    chooseSn: [], // 选择的sn
    dates:[], // 选择的时间
    data:{}, // 查出的数据
    beginTime:moment().subtract(6,'d').format(dateFormat),
    endTime:moment().format(dateFormat),
    cards: [],
    selectDates:{}, // 时间
    contents:{}, // 展示内容
    backItem:[],
    visible:false,
    drawData:[],
    activeKey:'1',
    rowKey:'index',
    currentShowSn:'',
    leftTableData:[],
    leftTableCurrent:1,
    rightTableData:[],
    rightTableLoading:false
  };
  leftColumns = [
    {
      title: 'SN',
      dataIndex: 'sn',
      fixed:'left',
      width:150
    },
    {
      title: formatMessage({ id: 'app.common.beginTime' }),
      dataIndex: 'beginTime',
      width:200
    },
    {
      title: formatMessage({ id: 'app.common.endTime' }),
      dataIndex: 'endTime',
      width:200
    },
    {
      title: formatMessage({ id: 'app.analyse.onlineSeconds' }),
      dataIndex: 'onlineSeconds',
      width:100,
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color='green'>{transSecondsToFormat(record.onlineSeconds)}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.analyse.lastOfflineSeconds' }),
      dataIndex: 'lastOfflineSeconds',
      width:150,
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color='cyan'>{transSecondsToFormat(record.lastOfflineSeconds)}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.analyse.reonlineTimes' }),
      dataIndex: 'reonlineTimes',
      width:150,
      align:'center',
    },
    {
      title: formatMessage({ id: 'app.analyse.errorRecordTimes' }),
      dataIndex: 'errorRecordTimes',
      align:'center',
      width:100,
    },
    {
      title: formatMessage({id:'app.common.options'}),
      width:100,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.showOrgData(record)}>
            <FormattedMessage id='app.common.details' />
          </a>
        </Fragment>
      ),
    },
  ];
  rightColumns = [
    {
      title: formatMessage({ id: 'app.analyse.recordTime' }),
      dataIndex: 'recordTime'
    },
    {
      title: formatMessage({ id: 'app.analyse.action' }),
      dataIndex: 'action',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color={record.action === 1 ? 'green' : (record.action === 2 ? 'blue':'magenta')}>{record.action === 1 ? formatMessage({id:'app.device.online'}) : (record.action === 2 ? formatMessage({id:'app.device.reOnline'}):formatMessage({id:'app.device.offline'}))}</Tag>
        </Fragment>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color='blue'>{record.ip}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({ id: 'app.analyse.checkResult' }),
      dataIndex: 'checkResult',
      align:'center',
      render: (text, record) => {
        let content = {};
        switch(record.checkResult){
          case 1:
            content = {color:'green',text:formatMessage({id:'app.analyse.right'})};
            break;
          case 2:
            content = {color:'volcano',text:formatMessage({id:'app.analyse.noShow'})};
            break;
          case 3:
            content = {color:'red',text:formatMessage({id:'app.analyse.sameIp'})};
            break;
          case 4:
            content = {color:'magenta',text:formatMessage({id:'app.analyse.noSameIp'})};
            break;
        }
        return (
          <Fragment>
            <Tag color={content.color}>{content.text}</Tag>
          </Fragment>
        )
      }
    },
  ];
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.requestAllSn();
    this.getDate(0);
  };

  /*获取所有的sn值*/
  requestAllSn() {
    const { dispatch } = this.props;
    const sns = [];
    dispatch({
      type: 'analyseOnline/getAllAntis',
      payload: { queryType: 1 },
      callback: (res) => {
        if (res) {
          res.list.forEach((item) => {
            sns.push(item.sn);
          });
          this.setState({ allSn: sns,filterSn: sns});
        }
      },
    });
  };
  getAnalyse = () => {
    const {dispatch} = this.props;
    const {beginTime,endTime,chooseSn} = this.state;
    this.setState({loading:true,data:[]});
    dispatch({
      type: 'analyseOnline/getAnalyse',
      payload: {beginTime:beginTime + ' 00:00:00',endTime:endTime + ' 00:00:00',snList:chooseSn.join()},
      callback: (res) => {
        if (res) {
          const snObj = {};
          const list = res.list;
          list.forEach((item)=>{
            if(!snObj[item.sn]) snObj[item.sn] = {};
            snObj[item.sn][item.date] = item;
          });
          this.setState({data:snObj},()=>{
            this.resolvePreDate()
          })
        }
        this.setState({loading:false});
      },
    });
  };
  /*时间的变化*/
  onChange = (value, dateString) => {
    if (value[1].diff(value[0], 'd') >= 7) {
      message.error(formatMessage({ id: 'app.statistics.more-than-sevenDays' }));
      return false;
    }
    this.setState({ beginTime: dateString[0], endTime: dateString[1],data:[]}, () => {
      this.getDate(1);

    });
  };

  /*生成日期*/
  getDate(type) {
    const { beginTime, endTime } = this.state;
    let momentBegin = moment(beginTime, dateFormat);
    const momentEnd = moment(endTime, dateFormat);
    const dates = [];
    while (momentEnd.diff(momentBegin, 'd') >= 0) {
      dates.push(momentBegin.format(dateFormat));
      momentBegin.add(1, 'days');
    }
    if(type) this.setState({dates,contents:{}},()=>{this.resolvePreDate()});
    else this.setState({dates});
  }
  /*处理每一个单元的时间*/
  resolvePreDate(sn){
    let newSelect = {};
    const {dates,selectDates,chooseSn} = this.state;
    const extra = dates.map((item) => (<Option key={item}>{item}</Option>));
    if(!!sn){
      this.selectChange(0,dates[0],sn);
      const select = <Select defaultValue={dates[0]} onChange={(value)=>this.selectChange(0,value,sn)} style={{ width: 120 }}>{extra}</Select>;
      newSelect[sn] = select;
    }else{
      this.selectChange(1);
      chooseSn.forEach((item)=>{
        const select = <Select defaultValue={dates[0]} onChange={(value)=>this.selectChange(0,value,item)} style={{ width: 120 }}>{extra}</Select>;
        newSelect[item] = select;
      });
    }

    const result = {...selectDates,...newSelect};
    this.setState({ selectDates:{}}, () => {
      this.setState({selectDates:result});
    });
  }
  selectChange = (type,value,sn) => {
    const {contents,data,chooseSn,dates} = this.state;
    const obj = {};
    if(type){
      const first = dates[0];
      chooseSn.forEach((item)=>{
        if(data[item] && data[item][first]) { // 必须存在sn和这个时间里的值
          const result = data[item][first];
          obj[item] = this.publicItem(result,item,first);
        }
      })
    }else{
      if(data[sn] && data[sn][value]) { // 必须存在sn和这个时间里的值
        const result = data[sn][value];
        obj[sn] = this.publicItem(result,sn,value);
      }
    }
    const newContents = {...contents,...obj};
    this.setState({contents:newContents});
  };
  /*展示原始数据*/
  showOrgData = (record) => {
    const {dispatch} = this.props;
    const {beginTime,endTime,sn} = record;
    const newEndTime = moment(endTime,dateFormatTwo).add(1,'s').format(dateFormatTwo);
    this.setState({rightTableLoading:true});
    dispatch({
      type: 'analyseOnline/getOrgData',
      payload: {beginTime,endTime:newEndTime,sn},
      callback: (res) => {
        this.setState({rightTableData:res.list,rightTableLoading:false});
      },
    });
  };
  /*公共部分*/
  publicItem(data,sn,date){
    let ele = [];
    let allOnlineSeconds = 0,maxOnlineSeconds = 0,minOnlineSeconds = 0,allReonlineTimes = 0,maxReonlineTimes = 0,
      minReonlineTimes = 0,maxLastOfflineSeconds = 0,minLastOfflineSeconds = 0,allErrorRecordTimes = 0,maxErrorRecordTimes = 0,
      minErrorRecordTimes = 0;
    allOnlineSeconds = data.allOnlineSeconds ? transSecondsToFormat(data.allOnlineSeconds) : 0;
    maxOnlineSeconds = data.maxOnlineSeconds ? transSecondsToFormat(data.maxOnlineSeconds) : 0;
    minOnlineSeconds = data.minOnlineSeconds ? transSecondsToFormat(data.minOnlineSeconds) : 0;
    maxLastOfflineSeconds = data.maxLastOfflineSeconds ? transSecondsToFormat(data.maxLastOfflineSeconds) : 0;
    minLastOfflineSeconds = data.minLastOfflineSeconds ? transSecondsToFormat(data.minLastOfflineSeconds) : 0;
    allReonlineTimes = data.allReonlineTimes;
    maxReonlineTimes = data.maxReonlineTimes;
    minReonlineTimes = data.minReonlineTimes;
    allErrorRecordTimes = data.allErrorRecordTimes;
    maxErrorRecordTimes = data.maxErrorRecordTimes;
    minErrorRecordTimes = data.minErrorRecordTimes;
    ele.push(<div key={`${sn}_${date}_1`}>{formatMessage({id:'app.analyse.allOnlineSeconds'})}：{allOnlineSeconds}</div>);
    ele.push(<div key={`${sn}_${date}_2`}>{formatMessage({id:'app.analyse.maxOnlineSeconds'})}：{maxOnlineSeconds}</div>);
    ele.push(<div key={`${sn}_${date}_3`}>{formatMessage({id:'app.analyse.minOnlineSeconds'})}：{minOnlineSeconds}</div>);
    ele.push(<div key={`${sn}_${date}_4`}>{formatMessage({id:'app.analyse.maxLastOfflineSeconds'})}：{maxLastOfflineSeconds}</div>);
    ele.push(<div key={`${sn}_${date}_5`}>{formatMessage({id:'app.analyse.minLastOfflineSeconds'})}：{minLastOfflineSeconds}</div>);
    ele.push(<div key={`${sn}_${date}_6`}>{formatMessage({id:'app.analyse.allReonlineTimes'})}：{allReonlineTimes}</div>);
    ele.push(<div key={`${sn}_${date}_7`}>{formatMessage({id:'app.analyse.maxReonlineTimes'})}：{maxReonlineTimes}</div>);
    ele.push(<div key={`${sn}_${date}_8`}>{formatMessage({id:'app.analyse.minReonlineTimes'})}：{minReonlineTimes}</div>);
    ele.push(<div key={`${sn}_${date}_9`}>{formatMessage({id:'app.analyse.allErrorRecordTimes'})}：{allErrorRecordTimes}</div>);
    ele.push(<div key={`${sn}_${date}_10`}>{formatMessage({id:'app.analyse.maxErrorRecordTimes'})}：{maxErrorRecordTimes}</div>);
    ele.push(<div key={`${sn}_${date}_11`} className='flex space-between'><div>{formatMessage({id:'app.analyse.minErrorRecordTimes'})}：{minErrorRecordTimes}</div><div><a onClick={() => this.showDetails(data,sn,date)}>{formatMessage({id:'app.common.details'})}>></a></div></div>);
    return ele;
  }
  /*详情展示*/
  showDetails = (data,sn) => {
    const newTable = data.details.map((item,index)=>{return {...item,...{index:index}}});
    this.setState({activeKey:'2',leftTableData:newTable,currentShowSn:sn,leftTableCurrent:1});
  };
  /*禁止日期*/
  disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };
  /*sn选择*/
  handleChange = (value) => {
    const {chooseSn,allSn,currentShowSn} = this.state;
    const diff = chooseSn.filter((key)=>!value.includes(key));
    const newAllSn = [...diff,...allSn];
    if(!value.includes(currentShowSn)) this.setState({activeKey:'1',leftTableData:[],rightTableData:[]});
    this.setState({ chooseSn: value,allSn:newAllSn});
  };
  onFocus = () => {
    this.setState({visible:true})
  };
  backVisible = (value) => {
    this.setState({visible:value})
  };
  /*双击选中sn*/
  clickItem = (item) => {
    if(!item) return;
    const {chooseSn,allSn,filterSn} = this.state;
    if (chooseSn.length + 1 > 5) {
      message.error(formatMessage({ id: 'app.analyse.searchSnLimitFive' }));
      return;
    }
    const newChooseSn = [...chooseSn,...[item]];
    const newAllSn = allSn.filter((key)=>key !== item);
    const newFilterSn = filterSn.filter((key)=>key !== item);
    this.setState({chooseSn:newChooseSn,allSn:newAllSn,filterSn:newFilterSn},()=>{this.resolvePreDate(item)});
  };
  /*模糊查询的改变事件*/
  drawerOnChange = (searchValue) => {
    const {allSn} = this.state;
    let newAllSn = allSn;
    if(!!searchValue){
      newAllSn = allSn.filter((item)=>item.indexOf(searchValue) > -1);
    }
    this.setState({filterSn:newAllSn})
  };
  /*改变tabs*/
  changeTabs = (key) => {
    this.setState({activeKey:key,rightTableData:[]})
  };
  /*点击时间段*/
  clickRange = (item) => {
    if(!item) return;
    let details = [];
    let leftTableCurrent = 1;
    const {sn,beginTime} = item;
    const {data} = this.state;
    const date = moment(beginTime).format(dateFormat);
    if(data[sn] && data[sn][date]){
      details = data[sn][date].details;
      details.forEach((item,index)=>{
        if(item.beginTime === beginTime){
          leftTableCurrent = Math.floor((index + 1)/5) + 1
        }
      });
      this.showOrgData(item);
    }
    this.setState({activeKey:'2',leftTableData:details,currentShowSn:sn,leftTableCurrent})
  };
  pageChange = (pagination) => {
    const {current} = pagination;
    this.setState({leftTableCurrent:current})
  };
  render() {
    const {
      filterSn, chooseSn, selectDates,rowKey,leftTableData,leftTableCurrent,
      visible,dates,data,loading,contents,activeKey,rightTableData,rightTableLoading
    } = this.state;
    const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
    const operations = (
      <RangePicker
        className='m-l-10'
        allowClear={false}
        format="YYYY-MM-DD"
        defaultValue={[moment(moment().subtract(6, 'days'), dateFormat), moment(moment(), dateFormat)]}
        placeholder={[formatMessage({ id: 'app.common.beginTime' }), formatMessage({ id: 'app.common.endTime' })]}
        disabledDate={this.disabledDate}
        onChange={this.onChange}
      />
    );
    const cards = [];
    if (chooseSn.length) {
      chooseSn.forEach((item, index) => {
        cards.push(
          <Col key={index} className='flex1'>
            <Card key={index} title={item} extra={selectDates[item]}>
              {contents[item]}
            </Card>
          </Col>,
        );
      });
    } else {
      for (let i = 0; i < 5; i++) {
        cards.push(
          <Col key={i} className='flex1'>
            <Card key={i}>
              <Skeleton/>
            </Card>
          </Col>,
        );
      }
    }
    return (
      <Card className={styles.analyseOnline} style={{height:'calc(100vh - 70px)'}}>
        <CommonDrawer
          dataList = {filterSn}
          visible = {visible}
          clickItem = {this.clickItem}
          onChange = {this.drawerOnChange}
          backVisible = {this.backVisible}
        />
        <Row className={styles.chooseSns}>
          <div id='select' style={{width:'100%'}}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={formatMessage({ id: 'app.analyse.pleaseChoose' })}
              value={chooseSn}
              onChange={this.handleChange}
              open = {false}
              onFocus = {this.onFocus}
            >
            </Select>
          </div>
          {operations}
          <Button type='primary' loading={loading} disabled={!chooseSn.length} onClick={this.getAnalyse} className='m-l-10'>{formatMessage({ id: 'app.common.search' })}</Button>
        </Row>
        <Row>
          <CommonGantt
          sns = {chooseSn}
          dates = {dates}
          data = {data}
          clickRange = {this.clickRange}
          />
        </Row>
        <Row>
          <Tabs activeKey={activeKey} onChange={this.changeTabs}>
            <TabPane tab={formatMessage({ id: 'app.analyse.overall' })} key='1'>
              <Row type='flex' justify='space-between' gutter={8}>
                {cards}
              </Row>
            </TabPane>
            <TabPane tab={formatMessage({ id: 'app.analyse.details' })} key='2'>
              <Row>
                <Row>
                  <Col span={12}>
                    <Card key={0} style={{border:'none'}} title={formatMessage({id:'app.analyse.analyseData'})}>
                      <Table
                        pagination={{defaultPageSize:5,current:leftTableCurrent}}
                        bordered
                        rowKey = {rowKey}
                        dataSource={leftTableData}
                        columns={this.leftColumns}
                        scroll={{x:1150}}
                        onChange = {this.pageChange}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card key={1} style={{border:'none'}} title={formatMessage({id:'app.analyse.orgData'})}>
                      <Table
                        bordered
                        pagination={{defaultPageSize:5}}
                        rowKey = {rowKey}
                        dataSource={rightTableData}
                        columns={this.rightColumns}
                        loading={rightTableLoading}
                      />
                    </Card>
                  </Col>
                </Row>
              </Row>
            </TabPane>
          </Tabs>
        </Row>
      </Card>
    );
  }
}

export default AnalyseOnline;
