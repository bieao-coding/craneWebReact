/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {resMessage} from '@/utils/utils'
import {Form,Row,Col,Button,Input,Table,message,Progress,Icon,Tag} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
@connect(({ platformUser, loading }) => ({
  platformUser,
  loading: loading.effects['crane/getCraneWorks'],
}))
class BindOperator extends Component {
  state = {
    craneId:null,
    loading:false,
    selectedRowKeys:[],
    rowKey:'workerId',
    placeHolder:formatMessage({id:'app.operator.workerName'}),
    list:[],
  };
  timer = null;
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.operator.workerName'}),
      dataIndex: 'workerName',
      width:200,
      align:'center'
    },
    {
      title: formatMessage({id:'app.operator.identityNumber'}),
      dataIndex: 'identityNumber',
      width:200,
      align:'center'
    },
    {
      title: formatMessage({id:'app.operator.face-template'}),
      dataIndex:'template',
      render: (text,record) => (
        <Fragment>
          <Progress status="active" percent={record.template}/>
        </Fragment>
      )
    },
    {
      title: formatMessage({id:'app.operator.face-status'}),
      dataIndex:'templateSyncStatus',
      width:100,
      render: (text,record) => {
        let result = {message:'',color:''};
        switch(record.templateSyncStatus){
          case 1:
          case 5:
            result = {message:formatMessage({id:'app.operator.face-status-success'}),color:'green'};
            break;
          case 2:
            result = {message:formatMessage({id:'app.operator.face-status-doing'}),color:'blue'};
            break;
          case 3:
            result = {message:formatMessage({id:'app.operator.face-status-wait'}),color:'orange'};
            break;
          case 4:
            result = {message:formatMessage({id:'app.operator.face-status-default'}),color:'red'};
            break;
          case 6:
            result = {message:formatMessage({id:'app.operator.face-model-noExist'}),color:'magenta'};
            break;
          default:
            result = {message:formatMessage({id:'app.operator.face-no'}),color:'red'};
            break;
        }
        return (
          <Fragment>
            <Tag color={result.color}>{result.message}</Tag>
          </Fragment>
        )
      }
    },
    {
      title: formatMessage({id:'app.operator.face-photo'}),
      dataIndex:'photo',
      render: (text,record) => (
        <Fragment>
          <Progress status="active" percent={record.photo}/>
        </Fragment>
      )
    },
    {
      title: formatMessage({id:'app.operator.face-status'}),
      dataIndex:'photoSyncStatus',
      width:100,
      render: (text,record) => {
        let result = {message:'',color:''};
        switch(record.photoSyncStatus){
          case 1:
          case 5:
            result = {message:formatMessage({id:'app.operator.face-status-success'}),color:'green'};
            break;
          case 2:
            result = {message:formatMessage({id:'app.operator.face-status-doing'}),color:'blue'};
            break;
          case 3:
            result = {message:formatMessage({id:'app.operator.face-status-wait'}),color:'orange'};
            break;
          case 4:
            result = {message:formatMessage({id:'app.operator.face-status-default'}),color:'red'};
            break;
          case 6:
            result = {message:formatMessage({id:'app.operator.face-model-noExist'}),color:'magenta'};
            break;
          default:
            result = {message:formatMessage({id:'app.operator.face-no'}),color:'red'};
            break;
        }
        return (
          <Fragment>
            <Tag color={result.color}>{result.message}</Tag>
          </Fragment>
        )
      }
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location && location.craneId){
      this.setState({craneId:location.craneId},()=>{
        this.getList();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/getCraneWorks',
      payload:this.state.craneId,
      callback:(res)=>{
        if(res){
          const array = [];
          res.Bind.forEach((item)=>{
            array.push(item.workerId)
          });
          const newData = res.All.map((item)=>{
            return {...item,...{template:0,templateSyncStatus:0,photo:0,photoSyncStatus:0}}
          });
          this.setState({list:newData,selectedRowKeys:array},()=>{
            if(res.Bind.length){
              this.getWorkerRate();
              this.refreshWorkerRate();
            }
          });
        }
      }
    });
  };

  /*绑定塔司*/
  save = () => {
    this.setState({loading:true});
    const { dispatch } = this.props;
    const {list,selectedRowKeys} = this.state;
    if(selectedRowKeys.length > 10){
      message.error(formatMessage({id:'app.operator.operator-ten'}));
      return;
    }
    dispatch({
      type: 'crane/saveOperators',
      payload:{list:selectedRowKeys,id:this.state.craneId},
      callback:(res)=>{
        if(res && res.status === 'Success'){
          setTimeout(()=>{this.setState({loading:false})},5000);
          this.closeWorkerRate();
          if(res.data){
            list.forEach((item)=>{
              if(!selectedRowKeys.includes(item.workerId)){
                Object.assign(item,{photo:0,photoSyncStatus:0,template:0,templateSyncStatus:0});
              }
            });
            this.setState({list:list})
            if(selectedRowKeys.length){
              this.refreshWorkerRate();
            }
          }else{
            message.error(formatMessage({id:'app.operator.device-offline'}))
          }
        }else{
          resMessage(res);
        }
      }
    });
  };
  /*选择变化*/
  changeSelect = (selectedRowKeys) => {
    this.setState({selectedRowKeys:selectedRowKeys});
  };
  /*获取百分比*/
  getWorkerRate(){
    const {dispatch} = this.props;
    const {selectedRowKeys} = this.state;
    dispatch({
      type: 'crane/getWorkerRate',
      payload:this.state.craneId,
      callback:(res)=>{
        if(res){
          this.showWorkerRate(res);
        }
      }
    });
  };
  /*展示百分比*/
  showWorkerRate(data){
    const template = data[0] || [];
    const photo = data[1] || [];
    const {list} = this.state;
    list.forEach((item)=>{
      let tIndex = null;
      let flag = template.some((res,index)=>{
        if(res.identityCard == item.identityNumber){
          tIndex = index;
          return true;
        }
        return false;
      })
      if(flag && tIndex != null){
        const temPieceNum = template[tIndex].pieceNum;
        const temPieceTotal = template[tIndex].pieceTotal;
        const temNeedSync = template[tIndex].needSync;
        const templatePercent = temPieceTotal ? Math.floor(temPieceNum/temPieceTotal  * 100) : 0;
        const photoPieceNum = photo[tIndex].pieceNum;
        const photoPieceTotal = photo[tIndex].pieceTotal;
        const photoNeedSync = photo[tIndex].needSync;
        const photoPercent = photoPieceTotal ? Math.floor(photoPieceNum/photoPieceTotal  * 100) : 0;
        Object.assign(item,{template:templatePercent,templateSyncStatus:temNeedSync,photo:photoPercent,photoSyncStatus:photoNeedSync});
      }
    })
    this.setState({list:list});
  }
  /*定时任务*/
  refreshWorkerRate(){
    this.timer = setInterval(()=>{this.getWorkerRate()},5000);
  }
  /*关闭模板定时*/
  closeWorkerRate(){
    if(this.timer) clearInterval(this.timer);
  }
  componentWillUnmount() {
    this.closeWorkerRate();
  }
  render() {
    const {loading} = this.state;
    const {placeHolder,rowKey,selectedRowKeys,list} = this.state;
    const rowSelection = {
      selectedRowKeys:selectedRowKeys,
      onChange: this.changeSelect,
    };
    return (
      <div className='p-l-10'>
        <Form layout="inline" className = 'm-b-10'>
          <Row type="flex" justify="end">
            <Button type="primary" className='m-r-5' loading={loading} onClick={() => this.save()}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </Row>
        </Form>
        <Table
          pagination = {false}
          rowKey = {rowKey}
          dataSource = {list}
          columns = {this.columns}
          rowSelection={rowSelection}
        />
      </div>
    );
  }
}

export default BindOperator;
