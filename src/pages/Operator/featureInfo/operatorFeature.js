/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Icon,Table,Card} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
@connect(({ operator, loading }) => ({
  operator,
  loading: loading.effects['operator/getFeature'],
}))
class Operator extends Component {
  state = {
    rowKey:'identityNumber',
    data:[]
  };
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.operator.identityNumber'}),
      dataIndex: 'identityNumber',
      align:'center'
    },
    {
      title: formatMessage({id:'app.operator.photo'}),
      dataIndex: 'photo',
      align:'center',
      render: (text,record) => (
        <Fragment>
          <img src={`data:image/png;base64,${record.photo}`} className = 'image-64'/>
        </Fragment>
      ),
    },
    // {
    //   title: '指纹',
    //   dataIndex: 'fingerprint',
    //   render: (record) => (
    //     <Fragment>
    //       <Icon className = 'success-color' type="check-circle" theme="filled" />
    //     </Fragment>
    //   ),
    // },
    {
      title: formatMessage({id:'app.common.time'}),
      align:'center',
      dataIndex: 'insertTime',
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    if(params && params.workerId){
      this.setState({id:params.workerId},()=>{
        this.getList();
      });
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'operator/getFeature',
      payload:this.state.id,
      callback:(res) => {
        this.setState({
          data: !!res.data.identityNumber ? [res.data] : []
        });
      }
    });
  };
  render() {
    const {loading} = this.props;
    return (
      <Card>
        <Table
          pagination = {false}
          rowKey = {this.state.rowKey}
          bordered
          dataSource={this.state.data}
          columns={this.columns}
          loading={loading}
        />
      </Card>
    );
  }
}

export default Operator;
