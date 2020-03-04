/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Card, Row, Col, Button, Input, Table, Select } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
const Option = Select.Option;
@connect(({ crane, loading }) => ({
  crane,
  loading: loading.effects['crane/getAllContacts'],
}))
class BindContactCopy extends React.Component {
  state = {
    filterList:[],
    selectedRows:[],
    cranes:[],
    searchValue:'',
    craneId:null,
    rowKey:'contactId',
    placeHolder:formatMessage({id:'app.contact.search'}),
  };
  list = [];
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.contact.contactName'}),
      dataIndex: 'contactName',
    },
    {
      title: formatMessage({id:'app.contact.contactMobile'}),
      dataIndex: 'contactMobile',
    },
    {
      title: formatMessage({id:'app.contact.contactEmail'}),
      dataIndex: 'contactEmail',
    },
    {
      title: formatMessage({id:'app.contact.contactTitle'}),
      dataIndex: 'contactTitle',
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getCranes();
  }
  /*请求事件*/
  getCranes = () => {
    const { dispatch,crane } = this.props;
    const {projectId,craneId} = crane;
    dispatch({
      type: 'crane/getCranes',
      payload:{queryType:1,projectId:projectId},
      callback:(res)=>{
        const cranes = res.list.filter((item)=>item.craneId !== craneId);
        if(!cranes.length){
          this.list = [];
          this.setState({cranes:[],filterList:[],craneId:null});
          return;
        }
        const newCranes = cranes.map((item) => {
          return <Option value={item.craneId} key={item.craneId}>{item.craneNumber}</Option>
        });
        this.setState({cranes:newCranes,craneId:cranes[0].craneId});
        this.getList(cranes[0].craneId);
      }
    });
  };
  /*请求事件*/
  getList = (craneId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/getCraneContacts',
      payload:{queryType:1,craneId:craneId},
      callback:(res) => {
        if(res){
          this.list = res.list;
          this.setState({filterList:res.list,searchValue:''});
        }
      }
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    this.setState({searchValue:e.target.value});
    this.search = e.target.value;
    let filter = this.list;
    if(!!this.search) {
      filter = this.list.filter((item) => item.contactName.indexOf(this.search) > -1 || item.contactMobile.indexOf(this.search) > -1)
    }
    this.setState({filterList:filter})
  };
  /*选择*/
  handleChange = (value) => {
    this.setState({craneId:value});
    this.getList(value)
  };
  /*保存*/
  save = () => {
    const {selectedRows} = this.state;
    const newRows = selectedRows.map((item)=>{return {...item,...{isLocal:1}}});
    this.props.dispatch({
      type: 'crane/modifySelect',
      payload: {copyList:newRows}
    });
    this.props.history.go(-1);
  };
  render() {
    const {loading} = this.props;
    const {filterList,cranes,craneId,searchValue} = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({selectedRows:selectedRows})
      }
    };
    return (
      <div className='p-l-10'>
        <Form layout="inline">
          <Row  type='flex' className='space-between m-b-10'>
            <div>
              <Select onChange={this.handleChange} value = {craneId} style={{ width: 80 }}>{cranes}</Select>
              <Input placeholder = {this.state.placeHolder} style={{ width: 200 }} value={searchValue} className = 'm-l-10' onChange={this.searchChange}/>
            </div>
            <Button type="primary" icon="plus" onClick={this.save}>
              <FormattedMessage id='app.common.add' />
            </Button>
          </Row>
        </Form>
        <Table
          rowSelection={rowSelection}
          loading={loading}
          dataSource={filterList}
          rowKey = {this.state.rowKey}
          columns = {this.columns}
        />
      </div>
    );
  }
}

export default BindContactCopy;
