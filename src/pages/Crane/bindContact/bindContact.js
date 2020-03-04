/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {Form,Card,Row,Col,Button,Input,Checkbox,Table,Popconfirm} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { resMessage, transCraneData } from '@/utils/utils';
import $ from 'jquery'
import router from "umi/router";

@connect(({ crane,user, loading }) => ({
  crane,
  auth:user.authorization,
  loading: loading.effects['crane/getCraneContacts'],
}))
class BindContact extends React.Component {
  state = {
    filterList:[],
    rowKey:'contactId',
    saveLoading:false,
    selectedRowKeys:[],
    isAdd:false,
    craneIds:[],
    craneNames:[],
    currentCraneId:null,
    placeHolder:formatMessage({id:'app.contact.search'}),
    allCol:{
      allColIsEnableSms:false,
      allColIsEnableEmail:false,
      allColIsEnableMoment:false,
      allColIsEnableAntiCollision:false,
      allColIsEnableOutOfZone:false,
      allColIsEnableSensor:false,
      allColIsEnableTrolley:false,
      allColIsEnableHeight:false,
      allColIsEnableBypass:false,
      allColIsEnablePower:false,
      allColIsEnableWind:false,
      allColIsEnableMaintenance:false,
      allColIsEnableTampered:false,
      allColIsEnableTurningAngle:false,
    }
  };
  selectedRowKeys = [];
  list = [];
  search = '';
  allSelect = ['isEnableSms','isEnableEmail','isEnableMoment','isEnableAntiCollision',
    'isEnableOutOfZone','isEnableSensor','isEnableTrolley','isEnableHeight','isEnableBypass',
    'isEnablePower','isEnableWind','isEnableMaintenance','isEnableTampered','isEnableTurningAngle'];
  paramsFalse = {isEnableSms:false,isEnableEmail:false,isEnableMoment:false,isEnableAntiCollision:false,
    isEnableOutOfZone:false,isEnableSensor:false,isEnableTrolley:false,isEnableHeight:false,isEnableBypass:false,
    isEnablePower:false,isEnableWind:false,isEnableMaintenance:false,isEnableTampered:false,isEnableTurningAngle:false};
  paramsTrue = {isEnableSms:true,isEnableEmail:true,isEnableMoment:true,isEnableAntiCollision:true,
    isEnableOutOfZone:true,isEnableSensor:true,isEnableTrolley:true,isEnableHeight:true,isEnableBypass:true,
    isEnablePower:true,isEnableWind:true,isEnableMaintenance:true,isEnableTampered:true,isEnableTurningAngle:true};
  /*列名*/
  columns = [
    {
      title: formatMessage({id:'app.contact.contactName'}),
      align:'center',
      dataIndex: 'contactName',
    },
    {
      title: formatMessage({id:'app.contact.contactMobile'}),
      align:'center',
      dataIndex: 'contactMobile',
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableSms'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableSms} onChange={(e) => this.checkColChange(0,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableSms',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableSms} onChange={(e) => this.checkChange(0,record,e)} />
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableEmail'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableEmail} onChange={(e) => this.checkColChange(1,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableEmail',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableEmail} onChange={(e) => this.checkChange(1,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableMoment'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableMoment}  onChange={(e) => this.checkColChange(2,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableMoment',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox  checked={record.isEnableMoment} onChange={(e) => this.checkChange(2,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableAntiCollision'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableAntiCollision}  onChange={(e) => this.checkColChange(3,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableAntiCollision',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableAntiCollision} onChange={(e) => this.checkChange(3,record,e)} />
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableOutOfZone'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableOutOfZone} onChange={(e) => this.checkColChange(4,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableOutOfZone',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableOutOfZone} onChange={(e) => this.checkChange(4,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableSensor'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableSensor} onChange={(e) => this.checkColChange(5,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableSensor',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableSensor} onChange={(e) => this.checkChange(5,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableTrolley'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableTrolley} onChange={(e) => this.checkColChange(6,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableTrolley',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableTrolley} onChange={(e) => this.checkChange(6,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableHeight'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableHeight} onChange={(e) => this.checkColChange(7,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableHeight',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableHeight} onChange={(e) => this.checkChange(7,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableBypass'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableBypass} onChange={(e) => this.checkColChange(8,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableBypass',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableBypass} onChange={(e) => this.checkChange(8,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnablePower'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnablePower} onChange={(e) => this.checkColChange(9,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnablePower',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnablePower} onChange={(e) => this.checkChange(9,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableWind'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableWind} onChange={(e) => this.checkColChange(10,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableWind',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableWind} onChange={(e) => this.checkChange(10,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableMaintenance'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableMaintenance} onChange={(e) => this.checkColChange(11,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableMaintenance',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableMaintenance} onChange={(e) => this.checkChange(11,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableTampered'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableTampered} onChange={(e) => this.checkColChange(12,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableTampered',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableTampered} onChange={(e) => this.checkChange(12,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: ()=>(
        <Fragment>
          <div className='flex'>
            <div>{formatMessage({id:'app.contact.isEnableTurningAngle'})}</div>
            <Checkbox className='m-l-10' checked={this.state.allCol.allColIsEnableTurningAngle} onChange={(e) => this.checkColChange(13,e)} />
          </div>
        </Fragment>
      ),
      dataIndex: 'isEnableTurningAngle',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Checkbox checked={record.isEnableTurningAngle} onChange={(e) => this.checkChange(13,record,e)}/>
        </Fragment>
      ),
    },
    {
      title: formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.crane_bindContactDelete ? (
            <Fragment>
              <a href = 'javascript:void(0)'  onClick={() => this.delete(record)}>
                <FormattedMessage id='app.common.delete' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getCranes();
    this.getList();
  }
  /*请求事件*/
  getCranes = () => {
    const { dispatch,crane } = this.props;
    const {projectId} = crane;
    dispatch({
      type: 'crane/getCranes',
      payload:{queryType: 1,projectId},
      callback:(res)=>{
        const newCraneIds = [],newCraneName = [];
        res.list.forEach((res)=>{
          newCraneIds.push(res.craneId);
          newCraneName.push(res.craneNumber);
        });
        this.setState({craneIds:newCraneIds,craneNames:newCraneName});
      }
    });
  };
  /*请求事件*/
  getList = (obj) => {
    const { dispatch } = this.props;
    let newObj = {};
    if(obj){
      newObj = obj;
    }else{
      newObj = this.props.crane;
    }
    const {craneId,addList,copyList} = newObj;
    dispatch({
      type: 'crane/getCraneContacts',
      payload:{queryType:1,craneId:craneId},
      callback:(res)=>{
        if(res){
          const newList = [...addList,...res.list];
          const copyNewList = copyList.filter((item)=>{
            return !newList.some((obj) => obj.contactId === item.contactId);
          });
          const isLastList = [...copyNewList,...newList];
          this.list = isLastList;
          this.checkColAndRow();
          this.checkAdd();
          this.setState({filterList:isLastList,currentCraneId:craneId})
        }
      }
    });
  };
  /*检查列全选和行全选*/
  checkColAndRow(){
    const rowKeys = [];
    const newAllCol = {};
    const {allCol} = this.state;
    // 检查行的勾选
    this.list.forEach((item)=>{
      let rowFlag = !this.allSelect.some((res)=>!item[res]);
      if(rowFlag) rowKeys.push(item.contactId);
    });
    // 检查列的勾选
    this.allSelect.forEach((item,index)=>{
      let colFlag = false;
      if(this.list.length){
        colFlag = !this.list.some((res)=>!res[item]);
      }
      const key = Object.keys(allCol)[index];
      if(colFlag) newAllCol[key] = true;
      else newAllCol[key] = false;
    });
    this.setState({selectedRowKeys:rowKeys,allCol:{...allCol,...newAllCol}});
  }
  /*检查是否有新增*/
  checkAdd(){
    const result = this.list.some((item)=>item.isLocal);
    this.setState({isAdd:result});
  }
  /*查询值更改*/
  searchChange = (e) =>{
    this.search = e.target.value;
    let filter = this.list;
    if(!!this.search) {
      filter = this.list.filter((item) => item.contactName.indexOf(this.search) > -1 || item.contactMobile.indexOf(this.search) > -1)
    }
    this.setState({filterList:filter})
  };
  /*删除*/
  delete = (record) => {
    const {isLocal,contactId,id} = record;
    if(!isLocal && id){
      this.props.dispatch({
        type: 'crane/deleteContact',
        payload:id,
      });
    }else{
      const {addList} = this.props.crane;
      const newAddList = addList.filter((item)=>item.contactId !== contactId);
      this.props.dispatch({
        type: 'crane/modifySelect',
        payload: {addList:newAddList}
      });
    }
    const newList = this.list.filter((item)=>item.contactId !== contactId);
    this.list = newList;
    this.checkColAndRow();
    this.checkAdd();
    this.searchChange({target:{value:this.search}});
  };
  /*新增*/
  add = () => {
    const ids = [];
    this.list.forEach((item)=>{
      ids.push(item.contactId);
    });
    router.push({
      pathname:'/crane/craneLayout/crane/bindContact/add',
      state:{ids:ids}
    });
  };
  /*复制*/
  copy = () => {
    const ids = [];
    this.list.forEach((item)=>{
      ids.push(item.contactId);
    });
    router.push({
      pathname:'/crane/craneLayout/crane/bindContact/copy',
      state:{ids:ids}
    });
  };
  /*保存*/
  save = (type) => {
    const { dispatch,crane } = this.props;
    const {projectId} = crane;
    const {currentCraneId} = this.state;
    this.setState({saveLoading:true});
    dispatch({
      type: 'crane/saveContact',
      payload:{craneId:currentCraneId,list:this.list,welcome:type},
      callback:(res)=>{
        if(res){
          resMessage(res);
          this.setState({saveLoading:false});
          if(res && res.status === 'Success'){
            router.push({
              pathname:'/crane/craneLayout/crane',
              state:{projectId}
            });
          }
        }
      }
    });
  };
  checkChange = (type,record,e) => {
    const {contactId} = record;
    const checked = e.target.checked;
    let params = {};
    switch(type){
      case 0:
        params = {isEnableSms:checked};
        break;
      case 1:
        params = {isEnableEmail:checked};
        break;
      case 2:
        params = {isEnableMoment:checked};
        break;
      case 3:
        params = {isEnableAntiCollision:checked};
        break;
      case 4:
        params = {isEnableOutOfZone:checked};
        break;
      case 5:
        params = {isEnableSensor:checked};
        break;
      case 6:
        params = {isEnableTrolley:checked};
        break;
      case 7:
        params = {isEnableHeight:checked};
        break;
      case 8:
        params = {isEnableBypass:checked};
        break;
      case 9:
        params = {isEnablePower:checked};
        break;
      case 10:
        params = {isEnableWind:checked};
        break;
      case 11:
        params = {isEnableMaintenance:checked};
        break;
      case 12:
        params = {isEnableTampered:checked};
        break;
      case 13:
        params = {isEnableTurningAngle:checked};
        break;
    }

    let rowFlag = true;
    this.list.forEach((item)=>{
      if(item.contactId === contactId){
        const newItem = {...item,...params};
        Object.assign(item,params);
        rowFlag = !this.allSelect.some((res)=>!newItem[res]);
      }
    });
    let colFlag = !this.list.some((item)=>!item[this.allSelect[type]]);
    let {selectedRowKeys} = this.state;
    if(rowFlag){
      if(!selectedRowKeys.includes(contactId)){
        selectedRowKeys.push(contactId);
      }
    }else{
      if(selectedRowKeys.includes(contactId)){
        selectedRowKeys = selectedRowKeys.filter((res)=>res !== contactId)
      }
    }
    const {allCol} = this.state;
    const key = Object.keys(allCol)[type];
    if(colFlag){
      allCol[key] = true;
    }else{
      allCol[key] = false;
    }
    this.setState({allCol,selectedRowKeys});
    this.searchChange({target:{value:this.search}});
  };

  checkColChange = (type,e) => {
    const checked = e.target.checked;
    let params = {},allCol = {};
    switch(type){
      case 0:
        params = {isEnableSms:checked};
        allCol = {allColIsEnableSms: checked};
        break;
      case 1:
        params = {isEnableEmail:checked};
        allCol = {allColIsEnableEmail: checked};
        break;
      case 2:
        params = {isEnableMoment:checked};
        allCol = {allColIsEnableMoment: checked};
        break;
      case 3:
        params = {isEnableAntiCollision:checked};
        allCol = {allColIsEnableAntiCollision: checked};
        break;
      case 4:
        params = {isEnableOutOfZone:checked};
        allCol = {allColIsEnableOutOfZone: checked};
        break;
      case 5:
        params = {isEnableSensor:checked};
        allCol = {allColIsEnableSensor: checked};
        break;
      case 6:
        params = {isEnableTrolley:checked};
        allCol = {allColIsEnableTrolley: checked};
        break;
      case 7:
        params = {isEnableHeight:checked};
        allCol = {allColIsEnableHeight: checked};
        break;
      case 8:
        params = {isEnableBypass:checked};
        allCol = {allColIsEnableBypass: checked};
        break;
      case 9:
        params = {isEnablePower:checked};
        allCol = {allColIsEnablePower: checked};
        break;
      case 10:
        params = {isEnableWind:checked};
        allCol = {allColIsEnableWind: checked};
        break;
      case 11:
        params = {isEnableMaintenance:checked};
        allCol = {allColIsEnableMaintenance: checked};
        break;
      case 12:
        params = {isEnableTampered:checked};
        allCol = {allColIsEnableTampered: checked};
        break;
      case 13:
        params = {isEnableTurningAngle:checked};
        allCol = {allColIsEnableTurningAngle: checked};
        break;
    }

    let {selectedRowKeys} = this.state;
    this.list.forEach((item)=>{
      const newItem = {...item,...params};
      Object.assign(item,params);
      let rowFlag = !this.allSelect.some((res)=>!newItem[res]);
      if(rowFlag){
        if(!selectedRowKeys.includes(item.contactId)){
          selectedRowKeys.push(item.contactId);
        }
      }else{
        if(selectedRowKeys.includes(item.contactId)){
          selectedRowKeys = selectedRowKeys.filter((res)=>res !== item.contactId)
        }
      }
    });
    this.setState({selectedRowKeys})
    const allColState = this.state.allCol;
    this.setState({allCol:{...allColState,...allCol}});
    this.searchChange({target:{value:this.search}});
  };
  /*选择变化*/
  changeSelect = (selectedRowKeys) => {
    this.setState({selectedRowKeys});
    this.list.forEach((item)=>{
      if(selectedRowKeys.includes(item.contactId)){
        Object.assign(item,this.paramsTrue);
      }else{
        if(!this.allSelect.some((res)=>!item[res])){
          Object.assign(item,this.paramsFalse);
        }
      }
    });

    const {allCol} = this.state;
    this.allSelect.forEach((res,index)=>{
      let colFlag = true;
      const result = this.list.some((item)=>!item[res]);
      if(result) colFlag = false;
      const key = Object.keys(allCol)[index];
      if(colFlag){
        allCol[key] = true;
      }else{
        allCol[key] = false;
      }
    });
    this.setState({allCol});
    this.searchChange({target:{value:this.search}});
  };
  clickDevice = (type) => {
    const {craneIds,currentCraneId} = this.state;
    const len = craneIds.length;
    const index = craneIds.indexOf(currentCraneId);
    let newCraneId = null;
    if(index >= 0 && index < len){
      if(type && index + 1 <= len){
        newCraneId = craneIds[index + 1];
      }
      if(!type && index - 1 >= 0){
        newCraneId = craneIds[index - 1];
      }
      const newParams = {craneId:newCraneId,addList: [],copyList:[]};
      this.getList(newParams);
      this.props.dispatch({
        type: 'crane/modifySelect',
        payload: newParams
      });
    }
  };
  render() {
    const {loading} = this.props;
    const {filterList,saveLoading,selectedRowKeys,isAdd,craneIds,currentCraneId,craneNames} = this.state;
    const len = craneIds.length;
    const craneIndex = craneIds.indexOf(currentCraneId);
    const craneName = craneNames[craneIndex];
    const rowSelection = {
      selectedRowKeys:selectedRowKeys,
      onChange: this.changeSelect,
    };
    return (
      <div className='p-l-10'>
        <Form>
          <Row type="flex" justify="space-between">
            <Col className = 'm-b-10 flex align-center'>
              <Input placeholder = {this.state.placeHolder} onChange={this.searchChange}/>
              <Button type="primary" className='m-r-10 m-l-10' disabled={!craneIndex} onClick={()=>this.clickDevice()}><FormattedMessage id='app.device.beforeDevice'/></Button>
              <Button type="primary" disabled={craneIndex + 1 >= len} onClick={()=>this.clickDevice(1)}><FormattedMessage id='app.device.afterDevice'/></Button>
              <span className='m-l-10 title' style={{marginBottom:0}}>{craneName}</span>
            </Col>
            <Col className = 'm-b-10'>
              <Row>
                {this.props.auth.crane_bindContactAdd ? (
                  <Button type="primary"  icon="plus" onClick={()=>this.add()}>
                    <FormattedMessage id='app.common.add' />
                  </Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.crane_bindContactCopy ? (
                  <Button type="primary"  icon="copy" className='m-l-10' onClick={()=>this.copy()}>
                    <FormattedMessage id='app.common.copy' />
                  </Button>
                ):(<Fragment></Fragment>)}
                {this.props.auth.crane_bindContactSave ? (
                    <Fragment>
                      {
                        isAdd ? (
                          <Popconfirm placement="topRight" title={formatMessage({id:'app.contact.welcomeSms'})} onConfirm={()=>this.save(1)} onCancel = {()=>this.save(0)} okText="Yes" cancelText="No">
                            <Button type="primary"  icon="save" className='m-l-10' disabled={!this.list.length} loading={saveLoading}>
                              <FormattedMessage id='app.common.save' />
                            </Button>
                          </Popconfirm>
                        ):(
                          <Button type="primary"  icon="save" className='m-l-10' disabled={!this.list.length} onClick={()=>this.save(0)} loading={saveLoading}>
                            <FormattedMessage id='app.common.save' />
                          </Button>
                        )
                      }
                    </Fragment>
                ):(<Fragment></Fragment>)}
              </Row>
            </Col>
          </Row>
        </Form>
        <Table
          loading={loading}
          dataSource={filterList}
          rowKey = {this.state.rowKey}
          columns = {this.columns}
          scroll = {{x:2200}}
          rowSelection={rowSelection}
        />
      </div>
    );
  }
}

export default BindContact;
