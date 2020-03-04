/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import CommonTable from '@/components/CommonTable';

@connect(({ allVideos, loading }) => ({
  allVideos,
  loading: loading.effects['allVideos/fetch'],
}))
class AllVideos extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'sn',
    placeHolder:'sn',
    auth:{}
  };
  /*列名*/
  columns = [
    {
      title: 'SN',
      dataIndex: 'sn'
    },
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName'
    },
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      align:'center'
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'online',
      render(val,record) {
        return <i className = {record.online ? 'iconfont icon-signal online-color':'iconfont icon-signal offline-color'}/>;
      }
    },
    {
      title: formatMessage({id:'app.common.lastLoginTime'}),
      dataIndex: 'lastLoginTime'
    }
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'allVideos/fetch',
      payload:this.state.params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'allVideos/setPage',
      payload:{pageNumber:page - 1,pageSize}
    })
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
    this.props.dispatch({
      type: 'allVideos/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    });

  };
  render() {
    const {allVideos,loading} = this.props;
    const {list,total} = allVideos;
    const {placeHolder,rowKey,params} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline" className = 'm-b-10'>
          <Row gutter={{ md:8,sm:8,xs: 8 }}>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="space-between">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search' />
                </Button>
              </Row>
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

export default AllVideos;
