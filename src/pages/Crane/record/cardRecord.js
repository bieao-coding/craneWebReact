/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import {Form,Card,Row,Col,Button,DatePicker,Tag } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const {RangePicker } = DatePicker;
@connect(({ crane, loading }) => ({
  crane,
  loading: loading.effects['crane/getRecord'],
}))
class CardRecord extends Component {
  state = {
    params:{
      craneId:null,
      beginTime:moment().subtract(6,'d').format(dateFormat),
      endTime:moment().format(dateFormat),
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'index',
    list:[],
    total:0
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.operator.workerName'}),
      dataIndex: 'workerName',
    },
    {
      title: formatMessage({id:'app.operator.identityNumber'}),
      dataIndex: 'identityNumber',
    },
    // {
    //   title: '打卡结果',
    //   dataIndex: 'result',
    //   render: (text, record) => (
    //     <Fragment>
    //       <Tag color={record.result ? 'blue':'red'}>{record.result ? '成功' : '失败'}</Tag>
    //     </Fragment>
    //   ),
    // },
    {
      title: formatMessage({id:'app.operator.faceTime'}),
      dataIndex: 'insertTime',
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.craneId){
      this.setState({
        params:{...this.state.params,...{craneId:location.craneId}}
      },()=>{
        this.getList();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/getRecord',
      payload:this.state.params,
      callback:(res)=>{
        const newList = res.list.map((item,index)=>{
          return {...item,...{index:index}}
        });
        this.setState({list:newList,total:res.total});
      }
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
  /*查询值更改*/
  searchChange = (e) =>{
    this.setState({
      params:{...this.state.params,...{search:e.target.value}}
    });
  };
  /*查询事件*/
  search = (e) => {
    e.preventDefault();
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  /*时间改变*/
  onChange = (value, dateString) => {
    this.setState({params:{...this.state.params,...{beginTime:dateString[0],endTime:dateString[1]}}})
  };
  render() {
    const {loading} = this.props;
    const {list,total} = this.state;
    const {rowKey,params} = this.state;
    return (
      <div className='p-l-10'>
        <Form onSubmit={this.search} layout="inline">
          <Row type='flex'>
            <RangePicker
              defaultValue = {[moment(params.beginTime, dateFormat), moment(params.endTime, dateFormat)]}
              showTime={{ format: 'HH:mm:ss' }}
              format={dateFormat}
              placeholder={[formatMessage({id:'app.common.beginTime'}), formatMessage({id:'app.common.endTime'})]}
              onChange={this.onChange}
              className='m-r-10 m-b-10'
            />
            <Button type="primary" className='m-b-10' icon="search" htmlType="submit">
              <FormattedMessage id='app.common.search' />
            </Button>
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
      </div>
    );
  }
}

export default CardRecord;
