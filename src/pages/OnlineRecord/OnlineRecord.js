/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form, Card, Row, Col, Button, Input, DatePicker, message,Tag} from 'antd';
import CommonTable from '@/components/CommonTable';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
@connect(({ onlineRecord, loading }) => ({
  onlineRecord,
  loading: loading.effects['lineRecord/fetch'],
}))
class OnlineRecord extends React.Component {
  state = {
    params:{
      search:'',
      beginTime:moment().subtract(3,'d').format(dateFormat),
      endTime:moment().format(dateFormat),
      pageNumber:0,
      pageSize:10
    },
    list:[],
    total:0,
    rowKey:'index',
    placeHolder:'SN',
  };
  /*列名*/
  columns = [
    {
      title: 'SN',
      dataIndex: 'sn',
    },
    {
      title: formatMessage({id:'app.device.time'}),
      dataIndex: 'insertTime',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'action',
      width:100,
      render: (text, record) => (
        <Fragment>
          <Tag color={record.action === 1 ? 'green' : (record.action === 2 ? 'blue':'magenta')}>{record.action === 1 ? formatMessage({id:'app.device.online'}) : (record.action === 2 ? formatMessage({id:'app.device.reOnline'}):formatMessage({id:'app.device.offline'}))}</Tag>
        </Fragment>
      )
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,onlineRecord } = this.props;
    const {pageNumber = 0, pageSize = 10} = onlineRecord;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'onlineRecord/getRecords',
      payload:params,
      callback:(res)=>{
        const newData = res.list.map((item,index)=>{
          return {...item,...{index:index}}
        });
        this.setState({list:newData,total:res.total});
      }
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'onlineRecord/setPage',
      payload:{pageNumber:page - 1,pageSize}
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
    const {beginTime,endTime} = this.state.params;
    if(moment(endTime,dateFormat).diff(moment(beginTime,dateFormat),'d') > 3){
      message.error(formatMessage({id:'app.device.find-three-day'}));
      return;
    }
    this.props.dispatch({
      type: 'onlineRecord/setPage',
      payload:{pageNumber:0}
    });
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  /*时间的变化*/
  onChange = (value, dateString) => {
    this.setState({params:{...this.state.params,...{beginTime:dateString[0],endTime:dateString[1]}}});
  };
  render() {
    const {loading} = this.props;
    const {list,total,placeHolder,rowKey,params} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline" className = 'm-b-10'>
          <Row type="flex">
            <Col className = 'm-r-5'>
              <RangePicker
                allowClear={false}
                value={[moment(params.beginTime, dateFormat), moment(params.endTime, dateFormat)]}
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
                onChange={this.onChange}
              />
            </Col>
            <Col className = 'm-r-10'>
              <Input placeholder = {placeHolder} onChange={this.searchChange} />
            </Col>
            <Col>
              <Button type="primary" icon="search" htmlType="submit">
                <FormattedMessage id='app.common.search' />
              </Button>
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
        />
      </Card>
    );
  }
}

export default OnlineRecord;
