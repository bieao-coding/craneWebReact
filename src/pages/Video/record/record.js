/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Icon, Table, Card, Tag } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
@connect(({ videoList, loading }) => ({
  videoList,
  loading: loading.effects['videoList/getBingRecord'],
}))
class Record extends Component {
  state = {
    rowKey:'index',
    data:[]
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName',
    },
    {
      title: formatMessage({id:'app.common.craneName'}),
      dataIndex: 'craneNumber',
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
    if(params && params.sn){
      this.setState({sn:params.sn},()=>{
        this.getList();
      });
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'videoList/getBingRecord',
      payload:this.state.sn,
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
      <Card>
        <Table
          rowKey = {this.state.rowKey}
          dataSource={this.state.data}
          columns={this.columns}
          loading={loading}
        />
      </Card>
    );
  }
}

export default Record;
