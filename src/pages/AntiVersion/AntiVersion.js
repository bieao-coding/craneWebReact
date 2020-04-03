/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Popconfirm,Form,Card,Row,Col,Button,Input} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {resMessage} from '@/utils/utils'
import CommonTable from '@/components/CommonTable';
import info from '@/defaultInfo';
@connect(({ antiVersion,user, loading }) => ({
  antiVersion,
  auth:user.authorization,
  loading: loading.effects['antiVersion/fetch'],
}))
class AntiVersion extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    rowKey:'softwareId',
    placeHolder:formatMessage({id:'app.device.softVersion'}),
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.device.versionName'}),
      dataIndex: 'softwareName',
    },
    {
      title: formatMessage({id:'app.device.softVersion'}),
      dataIndex: 'softwareVersion',
    },
    {
      title: formatMessage({id:'app.device.softwareVersionEx'}),
      dataIndex: 'softwareVersionEx',
    },
    {
      title: formatMessage({id:'app.device.CRC'}),
      dataIndex: 'crc',
    },
    {
      title: formatMessage({id:'app.device.softwareSize'}),
      dataIndex: 'softwareSize',
    },
    {
      title: formatMessage({id:'app.device.insertTime'}),
      dataIndex: 'insertTime',
    },
    {
      title:formatMessage({id:'app.device.description'}),
      dataIndex: 'description',
      render:(test,record)=>{
        const br = test.replace(/(\r\n|\n|\r)/gm,'<br/>');
        const brSplit = br.split('<br/>');
        let html = [];
        brSplit.forEach((item)=>{
          if(!!item){
            html.push(item);
            html.push(<br/>);
          }
        });
        return (<div>{html}</div>)
      }
    },
    {
      title:formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.anti_versions_delete ? (
            <Popconfirm title={<FormattedMessage id='app.common.delete-sure' />} onConfirm={() => this.delete(record)} okText={formatMessage({id:'app.common.sure'})} cancelText={formatMessage({id:'app.common.cancel'})}>
              <a><FormattedMessage id='app.common.delete' /></a>
            </Popconfirm>
          ):(
            <Fragment></Fragment>
          )}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,antiVersion } = this.props;
    const {pageNumber = 0, pageSize = 10} = antiVersion;
    const params = {...this.state.params,...{pageNumber,pageSize}};
    this.setState({params});
    dispatch({
      type: 'antiVersion/fetch',
      payload:params
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize:pageSize}};
    this.props.dispatch({
      type: 'antiVersion/setPage',
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
      type: 'antiVersion/setPage',
      payload:{pageNumber:0}
    })
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    })
  };
  /*新增*/
  add = () => {
    this.props.history.push('/device/anti/versions/add');
  };
  /*删除*/
  delete = (record) => {
    if(!record || !record.softwareId) return;
    this.props.dispatch({
      type: 'antiVersion/deleteVersion',
      payload:record.softwareId,
      callback:(res) => {
        resMessage(res);
        if(res && res.status === 'Success'){
          const obj = {...this.state.params,...{pageNumber:0}};
          this.setState({
            params:obj
          },() => {
            this.getList();
          });
        }
      }
    })
  };
  render() {
    const {antiVersion,loading} = this.props;
    const {list,total} = antiVersion;
    const {placeHolder,rowKey,params} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline" className = 'm-b-10'>
          <Row gutter={{ md:8,sm:8,xs: 8 }} >
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="space-between">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search' />
                </Button>
                {this.props.auth.anti_versions_add ? (
                  <Button type="primary" icon="plus" onClick={this.add}>
                    <FormattedMessage id='app.common.add' />
                  </Button>
                ):(<Fragment></Fragment>)}
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

export default AntiVersion;
