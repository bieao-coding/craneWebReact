/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Card, Row, Col, Button, Input, Table } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

@connect(({ crane, loading }) => ({
  crane,
  loading: loading.effects['crane/getAllContacts'],
}))
class BindContactForm extends React.Component {
  state = {
    filterList:[],
    selectedRows:[],
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
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/getAllContacts',
      payload:{queryType:1},
      callback:(res) => {
        if(res){
          const {ids} = this.props.location.state;
          const newList = res.list.filter((item)=>{
            return !ids.includes(item.contactId);
          });
          this.list = newList;
          this.setState({filterList:newList})
        }
      }
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    this.search = e.target.value;
    let filter = this.list;
    if(!!this.search) {
      filter = this.list.filter((item) => item.contactName.indexOf(this.search) > -1 || item.contactMobile.indexOf(this.search) > -1)
    }
    this.setState({filterList:filter})
  };
  /*保存*/
  save = () => {
    const {selectedRows} = this.state;
    const params = {isEnableSms:false,isEnableEmail:false,isEnableMoment:false,isEnableAntiCollision:false,
      isEnableOutOfZone:false,isEnableSensor:false,isEnableTrolley:false,isEnableHeight:false,isEnableBypass:false,
      isEnablePower:false,isEnableWind:false,isEnableMaintenance:false,isEnableTampered:false,isEnableTurningAngle:false};
    const newSelectRows = selectedRows.map((item)=>{return {...item,...params,...{isLocal:1}}});
    const {addList} = this.props.crane;
    this.props.dispatch({
      type: 'crane/modifySelect',
      payload: {addList:[...addList,...newSelectRows]}
    });
    this.props.history.go(-1);
  };
  render() {
    const {loading} = this.props;
    const {filterList} = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
       this.setState({selectedRows:selectedRows})
      }
    };
    return (
      <div className='p-l-10'>
        <Form layout="inline">
          <Row gutter={{ md:8,sm:8,xs: 8 }} className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {this.state.placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="end">
                <Button type="primary" icon="plus" onClick={this.save}>
                  <FormattedMessage id='app.common.add' />
                </Button>
              </Row>
            </Col>
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

export default BindContactForm;
