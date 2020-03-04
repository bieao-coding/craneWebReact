/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import {Card,Row,Col,Button,Input,Table,Tag,InputNumber, Popconfirm, Form,Select} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {stringify} from "qs";
import router from "umi/router";
const FormItem = Form.Item;
const EditableContext = React.createContext();
const Option = Select.Option;
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);
class EditableCell extends React.Component {
  getInput = () => {
    const type = this.props.inputType;
    const dataIndex = this.props.dataIndex;
    if (type === 'numberRule') {
      return <InputNumber min={-360} max={360} />;
    }else if(type === 'select'){
      if(dataIndex === 'a'){
        return  <Select>
          <Option value = {1}>顺时针</Option>
          <Option value = {-1}>逆时针</Option>
        </Select>
      }else{
        return  <Select>
          <Option value = {0}><FormattedMessage id='app.common.disable'/></Option>
          <Option value = {1}><FormattedMessage id='app.common.enable'/></Option>
        </Select>
      }
    }else{
      return <InputNumber />;
    }
  };
  render() {
    const {editing, dataIndex, title, inputType, record, index, ...restProps} = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: true,
                      message: formatMessage({id:'app.common.require-value'}),
                    }],
                    initialValue: record[dataIndex],
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}
@connect(({ monitor, loading }) => ({
  monitor,
  loading: loading.effects['monitor/getConfig'],
}))
class CraneConfig extends Component {
  clickCraneId = null;
  constructor(props) {
    super(props);
    this.state = {
      buttonLoading:false,
      editingKey: '' ,
      projectId:null,
      rowKey:'craneId',
      placeHolder:'sn',
      data:[],
      maxHeight:0
    };
    /*列名*/
    this.columns = [
      {
        title: formatMessage({id:'app.common.craneName'}),
        dataIndex: 'craneNumber',
      },
      {
        title: 'SN',
        dataIndex: 'sn',
      },
      {
        title: formatMessage({id:'app.common.craneType'}),
        align:'center',
        dataIndex: 'craneType',
        render: (text, record) => (
          <Fragment>
            <Tag color={!record.craneType ? 'green' : ((record.craneType === 1) ? 'blue':'orange')}>{!record.craneType ? formatMessage({id:'app.common.flat-crane'}) : ((record.craneType === 1) ? formatMessage({id:'app.common.movable-crane'}):formatMessage({id:'app.common.head-crane'}))}</Tag>
          </Fragment>
        ),
      },
      // {
      //   title: '臂长',
      //   align:'center',
      //   dataIndex: 'armLength',
      // },
      // {
      //   title: '回转方向',
      //   dataIndex: 'a',
      //   editable: true,
      //   align:'center',
      //   render: (text, record) => (
      //     <Fragment>
      //       <Tag color={record.a === -1 ? 'green' : 'orange'}>{record.a === -1 ? '顺时针' : '逆时针'}</Tag>
      //     </Fragment>
      //   ),
      // },
      // {
      //   title: '回转偏移',
      //   dataIndex: 'b',
      //   editable: true,
      //   align:'center',
      // },
      {
        title: 'X',
        dataIndex: 'x',
        editable: true,
        align:'center',
        render: (text, record) => (
          Math.round(record.x * 100)/100
        ),
      },
      {
        title: 'Y',
        dataIndex: 'y',
        editable: true,
        align:'center',
        render: (text, record) => (
          Math.round(record.y * 100)/100
        ),
      },
      {
        title: formatMessage({id:'app.monitor.isCustom'}),
        align:'center',
        dataIndex: 'isCustom',
        editable: true,
        render: (text, record) => (
          <Fragment>
            <Tag color={!record.isCustom ? 'red' : 'green'}>{!record.isCustom ? formatMessage({id:'app.common.disable'}) : formatMessage({id:'app.common.enable'})}</Tag>
          </Fragment>
        ),
      },
      {
        title: formatMessage({id:'app.common.options'}),
        render: (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        href="javascript:void(0)"
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                      >
                        <FormattedMessage id='app.common.sure' />
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Sure to cancel?"
                    onConfirm={() => this.cancel(record.key)}
                  >
                    <a><FormattedMessage id='app.common.cancel' /></a>
                  </Popconfirm>
                </span>
              ) : (
                <a onClick={() => this.edit(record,record.key)}>
                  <FormattedMessage id='app.common.edit' />
                </a>
              )}
            </div>
          );
        },
      },
    ];
  }
  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.projectId){
      this.setState({projectId:location.projectId},()=>{
        this.getList();
      })
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.setState({projectId:nextState.projectId},()=>{
        this.getList();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getConfig',
      payload:this.state.projectId,
      callback:(res)=>{
        const newData = res.craneList.map((item,index)=>{
          return Object.assign(item,{key:index})
        });
        this.setState({data:newData})
      }
    });
  };
  isEditing = record => {
    return record.key === this.state.editingKey;
  }
  cancel = () => {
    this.setState({ editingKey: '' });
  };
  /*保存*/
  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const orgData = this.state.data;
      if(orgData.length){
        const newData = {...row,...{craneId:this.state.data[key].craneId}};
        this.props.dispatch({
          type: 'monitor/saveConfig',
          payload:JSON.stringify([newData]),
          callback:(res) => {
            resMessage(res);
            if(res && res.status === 'Success'){
              this.setState({buttonLoading:false});
              this.setState({editingKey: '' });
              this.getList();
            }
          }
        })
      }
    });
  }
  edit(record,key) {
    this.clickCraneId = record.craneId;
    this.setState({ editingKey: key });
  }
  /*高级配置*/
  heightConfig = () => {
    router.push({
      pathname:`/monitor/monitorLayout/crane/height`,
      state:{projectId:this.state.projectId}
    });
  };
  render() {
    const {data} = this.state;
    const {loading} = this.props;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'a' || col.dataIndex === 'isCustom' ? 'select' : (col.dataIndex === 'b' ? 'numberRule' : 'number'),
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });
    return (
      <div className = 'edit-table'>
        <Form layout="inline">
          <Row className = 'm-b-10'>
            <a href='javascript:void(0)' onClick={this.heightConfig}><FormattedMessage id='app.monitor.highConfig' />></a>
          </Row>
        </Form>
        <Table
          components={components}
          loading={loading}
          dataSource = {data}
          rowKey = {this.state.rowKey}
          columns = {columns}
        />
      </div>
    );
  }
}

export default CraneConfig;
