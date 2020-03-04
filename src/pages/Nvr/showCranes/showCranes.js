/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Tag,Input,Table} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

@connect(({ nvr, loading }) => ({
  nvr,
  loading: loading.effects['nvr/getNvrCranes'],
}))
class ShowCranes extends React.Component {
  state = {
    list:[],
    filterList:[],
    total:0,
    rowKey:'index',
    placeHolder:formatMessage({id:'app.common.craneName'})
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        // if (!(index%4)) {
        //   obj.props.rowSpan = 4;
        // }
        // if(index%4){
        //   obj.props.rowSpan = 0;
        // }
        return obj;
      },
    },
    {
      title: formatMessage({id:'app.nvr.channel'}),
      dataIndex: 'nvrChannel',
      align:'center'
    },
    {
      title: formatMessage({id:'app.nvr.cameraChannel'}),
      dataIndex: 'cameraChannel',
      render: (text, record) => (
        <Fragment>
          <Tag color={record.cameraChannel === 1 ? 'green' : ((record.cameraChannel === 2) ? 'blue':(record.cameraChannel === 3 ? 'magenta':'cyan'))}>{
            record.cameraChannel === 1 ? formatMessage({id:'app.nvr.main'}) : ((record.cameraChannel === 2) ? formatMessage({id:'app.nvr.jib'}):(record.cameraChannel === 3 ? formatMessage({id:'app.nvr.balance'}):formatMessage({id:'app.nvr.cabin'})))}</Tag>
        </Fragment>
      )
    },
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName'
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.nvrId){
      this.setState({id:params.nvrId},()=>{
        this.getList();
      });
    }
  }
  /*获取所属塔机*/
  getList = () => {
    this.props.dispatch({
      type: 'nvr/getNvrCranes',
      payload:{id:this.state.id,queryType:1},
      callback:(res)=>{
        const newList = res.map((item,index)=>{
          return {...item,...{index:index.toString()}}
        });
        this.setState({list:newList,filterList:newList});
      }
    })
  };
  /*查询值更改*/
  searchChange = (e) =>{
    const value = e.target.value;
    const {list} = this.state;
    let newList = list;
    if(!!value){
      newList = list.filter((item)=>{
        return item.craneNumber.indexOf(value) !== -1;
      });
    }
    this.setState({filterList:newList});
  };
  render() {
    const {loading} = this.props;
    const {filterList,rowKey,placeHolder} = this.state;
    return (
      <Card>
        <Form onSubmit={this.search} layout="inline">
          <Row gutter={{ md:8,sm:8,xs: 8 }} className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {placeHolder} onChange={this.searchChange}/>
            </Col>
          </Row>
        </Form>
        <Table
          loading={loading}
          dataSource = {filterList}
          rowKey = {rowKey}
          pagination={false}
          columns = {this.columns}
        />
      </Card>
    );
  }
}

export default ShowCranes;
