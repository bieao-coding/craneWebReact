/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Icon, Table, Card, Tag } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
@connect(({ crane, loading }) => ({
  crane,
  loading: loading.effects['crane/getBingRecord'],
}))
class BindRecord extends Component {
  state = {
    rowKey:'index',
    data:[]
  };
  /*列名*/
  columns = [
    {
      title: 'SN',
      dataIndex: 'sn',
    },
    {
      title: formatMessage({id:'app.common.deviceType'}),
      dataIndex: 'deviceType',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color={!record.deviceType ? 'green' : 'red'}>{!record.deviceType ? formatMessage({id:'app.common.anti'}) : formatMessage({id:'app.common.video'})}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.options'}),
      dataIndex: 'action',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color={record.action ? 'green' : 'red'}>{record.action ? formatMessage({id:'app.common.binding'}) : formatMessage({id:'app.common.unbinding'})}</Tag>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.time'}),
      align:'center',
      dataIndex: 'insertTime',
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.craneId){
      this.setState({id:params.craneId},()=>{
        this.getList();
      });
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/getBingRecord',
      payload:this.state.id,
      callback:(res) => {
        const newData = res.data.map((item,index)=>{
          return {...item,...{index:index}}
        });
        this.setState({
          data: newData
        });
      }
    });
  };
  render() {
    const {loading} = this.props;
    return (
      <div className='p-l-10'>
        <Table
          rowKey = {this.state.rowKey}
          dataSource={this.state.data}
          columns={this.columns}
          loading={loading}
        />
      </div>
    );
  }
}

export default BindRecord;
