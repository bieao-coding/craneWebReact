/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Input,Card,Button,Select } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import {message} from "antd/lib/index";
const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;
@connect(({ crane }) => ({
  crane
}))
@Form.create()
class BindNvr extends Component {
  state = {
    loading:false,
    models:[],
    nvrObj:{},
    confirmMainHook:false,
    confirmJib:false,
    confirmBalance:false,
    confirmCabin:false,
    params:{
      craneId:null,
      mainHookNvrId:null,
      jibNvrId:null,
      balanceNvrId:null,
      cabinNvrId:null,
      mainHookChannel:null,
      jibChannel:null,
      balanceChannel:null,
      cabinChannel:null,
      mainHookAddr:null,
      jibAddr:null,
      balanceAddr:null,
      cabinAddr:null
    }
  };
  index = 0;
  token = null;
  index1 = 0;
  AppKey = 'e2cba1a253ba4aa7a6d23293cea3bcd3';
  Secret = 'c2f27bf2abaae384e50ad12e7952b32d';
  /*DOM加载完成后执行*/
  componentDidMount() {
    this.token = localStorage.getItem('token');
    const params = this.props.location.state;
    if(params && params.craneId){
      this.setState({id:params.craneId},()=>{
        this.getCraneNvr();
        this.getNvrs();
      });
    }
  }
  /*获取单项数据*/
  getCraneNvr(){
    this.props.dispatch({
      type: 'crane/getCraneNvr',
      payload:this.state.id,
      callback:(res)=>{
        if(!!res){
          this.setState({params:res});
        }
      }
    })
  };
  /*获取nvr型号*/
  getNvrs(){
    this.props.dispatch({
      type: 'crane/getNvrs',
      payload:{queryType:1},
      callback:(res)=>{
        this.resolveNvrList(res.list);
        const models = res.list.map((item)=>{
          return <Option value={item.nvrId}  key={item.nvrId}>{item.nvrSn}</Option>
        })
        this.setState({models:models});
      }
    })
  }
  /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    const craneId = this.state.params.craneId;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      this.props.dispatch({
        type: !!craneId ? 'crane/editNvr' : 'crane/addNvr',
        payload:!!craneId ? {...this.state.params,...values} : {...this.state.params,...values,...{craneId:this.state.id}},
        callback:(res) => {
          resMessage(res);
          this.setState({loading:false});
          if(res && res.status === 'Success'){
            this.props.history.go(-1);
          }
        }
      })
    });
  };
  /*处理NVR*/
  resolveNvrList(data){
    const obj = {};
    data.forEach((item)=>{
      if(!obj[item.nvrId]){
        obj[item.nvrId] = item;
      }
    });
    this.setState({nvrObj:obj});
  }
  change = (value) => {
    if(!this.index){
      this.props.form.setFieldsValue({mainHookNvrId:value,jibNvrId:value,cabinNvrId:value,balanceNvrId:value,mainHookAddr:null})
    }
    this.index++;
  };
  changeJib = () => {
    this.props.form.setFieldsValue({jibAddr:null})
  };
  changeBalance = () => {
    this.props.form.setFieldsValue({balanceAddr:null})
  };
  changeCabin = () => {
    this.props.form.setFieldsValue({cabinAddr:null})
  };
  /*主钩对比*/
  compareToFirstMainHook = (rule, value, callback) => {
    const {nvrObj} = this.state;
    const form = this.props.form;
    const nvrId = form.getFieldValue('mainHookNvrId');
    let channelCount = 0;
    if(nvrId && nvrObj[nvrId]){
      channelCount = nvrObj[nvrId].nvrChannelCount;
    }
    if(!!value){
      if(!channelCount){
        callback(formatMessage({id:'app.nvr.channel-not-zero'}));
      }else if (!/^[1-9](\d+)?$/.test(value) || value > channelCount) {
        callback(formatMessage({id:'app.nvr.channel-range'},{channelCount:channelCount}));
      }
    }
    callback();
  };
  /*主钩对比*/
  validateToNextMainHook = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmMainHook) {
      form.validateFields(['mainHookChannel'], { force: true });
    }
    callback();
  };
  /*主钩事件*/
  handleConfirmMainHook = (e) => {
    const value = e.target.value;
    this.setState({ confirmMainHook: this.state.confirmMainHook || !!value });
  };
  /*起重臂比*/
  compareToFirstJib = (rule, value, callback) => {
    const {nvrObj} = this.state;
    const form = this.props.form;
    const nvrId = form.getFieldValue('jibNvrId');
    let channelCount = 0;
    if(nvrId && nvrObj[nvrId]){
      channelCount = nvrObj[nvrId].nvrChannelCount;
    }
    if(!!value){
      if(!channelCount){
        callback(formatMessage({id:'app.nvr.channel-not-zero'}));
      }else if (!/^[1-9](\d+)?$/.test(value) || value > channelCount) {
        callback(formatMessage({id:'app.nvr.channel-range'},{channelCount:channelCount}));
      }
    }
    callback();
  };
  /*主钩对比*/
  validateToNextJib = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmJib) {
      form.validateFields(['jibChannel'], { force: true });
    }
    callback();
  };
  /*主钩事件*/
  handleConfirmJib = (e) => {
    const value = e.target.value;
    this.setState({ confirmJib: this.state.confirmJib || !!value });
  };
  /*平衡臂比*/
  compareToFirstBalance = (rule, value, callback) => {
    const {nvrObj} = this.state;
    const form = this.props.form;
    const nvrId = form.getFieldValue('balanceNvrId');
    let channelCount = 0;
    if(nvrId && nvrObj[nvrId]){
      channelCount = nvrObj[nvrId].nvrChannelCount;
    }
    if(!!value){
      if(!channelCount){
        callback(formatMessage({id:'app.nvr.channel-not-zero'}));
      }else if (!/^[1-9](\d+)?$/.test(value) || value > channelCount) {
        callback(formatMessage({id:'app.nvr.channel-range'},{channelCount:channelCount}));
      }
    }
    callback();
  };
  /*平衡臂对比*/
  validateToNextBalance = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmBalance) {
      form.validateFields(['balanceChannel'], { force: true });
    }
    callback();
  };
  /*平衡臂事件*/
  handleConfirmBalance = (e) => {
    const value = e.target.value;
    this.setState({ confirmBalance: this.state.confirmBalance || !!value });
  };
  /*驾驶室对比*/
  compareToFirstCabin = (rule, value, callback) => {
    const {nvrObj} = this.state;
    const form = this.props.form;
    const nvrId = form.getFieldValue('cabinNvrId');
    let channelCount = 0;
    if(nvrId && nvrObj[nvrId]){
      channelCount = nvrObj[nvrId].nvrChannelCount;
    }
    if(!!value){
      if(!channelCount){
        callback(formatMessage({id:'app.nvr.channel-not-zero'}));
      }else if (!/^[1-9](\d+)?$/.test(value) || value > channelCount) {
        callback(formatMessage({id:'app.nvr.channel-range'},{channelCount:channelCount}));
      }
    }
    callback();
  };
  /*驾驶室对比*/
  validateToNextCabin = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmCabin) {
      form.validateFields(['cabinChannel'], { force: true });
    }
    callback();
  };
  /*驾驶室事件*/
  handleConfirmCabin = (e) => {
    const value = e.target.value;
    this.setState({ confirmCabin: this.state.confirmCabin || !!value });
  };
  /*获取地址*/
  getSingleAddress = (value) => {
    let msg = '';
    const {nvrObj} = this.state;
    const {form} = this.props;
    let id = null;
    let channel = null;
    switch(value){
      case 1:
        id = form.getFieldValue('mainHookNvrId');
        channel = form.getFieldValue('mainHookChannel');
        if(!id){
          msg = formatMessage({id:'app.nvr.choose-nvr'});
        } else if(!/^[1-9](\d+)?$/.test(channel)){
          msg = formatMessage({id:'app.nvr.enter-nvr'});
        }else{
          const {nvrSn,nvrCode} = nvrObj[id];
          this.props.form.setFieldsValue({mainHookAddr:''});
          this.getToken(nvrSn,nvrCode,channel,'mainHookAddr');
        }
        break;
      case 2:
        id = form.getFieldValue('jibNvrId');
        channel = form.getFieldValue('jibChannel');
        if(!id){
          msg = formatMessage({id:'app.nvr.choose-nvr'});
        } else if(!/^[1-9](\d+)?$/.test(channel)){
          msg = formatMessage({id:'app.nvr.enter-nvr'});
        }else{
          const {nvrSn,nvrCode} = nvrObj[id];
          this.props.form.setFieldsValue({jibAddr:''});
          this.getToken(nvrSn,nvrCode,channel,'jibAddr');
        }
        break;
      case 3:
        id = form.getFieldValue('balanceNvrId');
        channel = form.getFieldValue('balanceChannel');
        if(!id){
          msg = formatMessage({id:'app.nvr.choose-nvr'});
        } else if(!/^[1-9](\d+)?$/.test(channel)){
          msg = formatMessage({id:'app.nvr.enter-nvr'});
        }else{
          const {nvrSn,nvrCode} = nvrObj[id];
          this.props.form.setFieldsValue({balanceAddr:''});
          this.getToken(nvrSn,nvrCode,channel,'balanceAddr');
        }
        break;
      case 4:
        id = form.getFieldValue('cabinNvrId');
        channel = form.getFieldValue('cabinChannel');
        if(!id){
          msg = formatMessage({id:'app.nvr.choose-nvr'});
        } else if(!/^[1-9](\d+)?$/.test(channel)){
          msg = formatMessage({id:'app.nvr.enter-nvr'});
        }else{
          const {nvrSn,nvrCode} = nvrObj[id];
          this.props.form.setFieldsValue({cabinAddr:''});
          this.getToken(nvrSn,nvrCode,channel,'cabinAddr');
        }
        break;
    }
    if(!!msg){
      message.error(msg);
    }
  };
  /*获取token*/
  getToken(sn,password,channel,addr){
    const { dispatch } = this.props;
    if(!this.token){
      dispatch({
        type: 'crane/getToken',
        payload:{appKey:this.AppKey,appSecret:this.Secret},
        callback:(res)=>{
          localStorage.setItem('token',res.data.accessToken);
          this.token = res.data.accessToken;
          this.addDevice(sn,password,channel,addr);
        }
      });
    }else{
      this.addDevice(sn,password,channel,addr);
    }
  }
  /*检查token过期*/
  checkToken(sn,password,channel,addr){
    if(!this.index1){
      this.token = null;
      this.getToken(sn,password,channel,addr);
      this.index1++;
    }else{
      message.error(formatMessage({id:'app.common.error'}));
    }
  }
  addDevice(sn,password,channel,addr){
    this.props.dispatch({
      type: 'crane/addDevice',
      payload:{accessToken:this.token,deviceSerial:sn,validateCode:password},
      callback:(res)=>{
        if(res.code === '200' || res.code === '20017'){ // 2017已添加
          this.openLive(sn,password,channel,addr);
        }else if(res.code === '10002'){
          this.checkToken(sn,password,channel,addr);
        }else{
          message.error(formatMessage({id:`app.nvr.${res.code}`}));
        }
      }
    });
  }
  /*开通直播*/
  openLive(sn,password,channel,addr){
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/openLive',
      payload:{accessToken:this.token,source:`${sn}:${channel}`},
      callback:(res)=>{
        if(res.code === '200' || res.code === '60062'){
          this.getAddress(sn,password,channel,addr);
        }else{
          message.error(formatMessage({id:`app.nvr.${res.code}`}));
        }
      }
    });
  }
  /*获取地址*/
  getAddress(sn,password,channel,addr){
    const { dispatch } = this.props;
    dispatch({
      type: 'crane/getLiveAddress',
      payload:{accessToken:this.token,source:`${sn}:${channel}`},
      callback:(res)=>{
        if(res.code === '200'){
          const data = res.data[0];
          const hls = data.hls;
          const obj = {};
          obj[addr] = hls;
          this.props.form.setFieldsValue(obj);
          if(data.ret === '200') message.success(formatMessage({id:`app.nvr.${data.ret}`}));
          else message.error(formatMessage({id:`app.nvr.${data.ret}`}));
        }else{
          message.error(formatMessage({id:`app.nvr.${res.code}`}));
        }
      }
    });
  }
  filter = (inputValue, path) => {
    return path.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
    const {params,models} = this.state;
    //自适应
    const formItemLayout = {
      labelCol: {
        sm: { span: 8 },
        md: { span: 8 },
        xl: { span: 8 }
      },
      wrapperCol: {
        sm: { span: 12 },
        md: { span: 12 },
        xl: { span: 8 }
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    // 验证规则
    const formRules = {
      mainHookNvrId:{
        //rules:[{validator: this.validateToNextMainHook}],
        initialValue:this.state.params.mainHookNvrId
      },
      mainHookChannel:{
        //rules:[{validator: this.compareToFirstMainHook}],
        initialValue:this.state.params.mainHookChannel
      },
      mainHookAddr:{
        initialValue:this.state.params.mainHookAddr
      },
      jibNvrId:{
        //rules:[{validator: this.validateToNextJib}],
        initialValue:this.state.params.jibNvrId
      },
      jibChannel:{
        //rules:[{validator: this.compareToFirstJib}],
        initialValue:this.state.params.jibChannel
      },
      jibAddr:{
        initialValue:this.state.params.jibAddr
      },
      balanceNvrId:{
        //rules:[{validator: this.validateToNextBalance}],
        initialValue:this.state.params.balanceNvrId
      },
      balanceChannel:{
        //rules:[{validator: this.compareToFirstBalance}],
        initialValue:this.state.params.balanceChannel
      },
      balanceAddr:{
        initialValue:this.state.params.balanceAddr
      },
      cabinNvrId:{
        //rules:[{validator: this.validateToNextCabin}],
        initialValue:this.state.params.cabinNvrId
      },
      cabinChannel:{
        //rules:[{validator: this.compareToFirstCabin}],
        initialValue:this.state.params.cabinChannel
      },
      cabinAddr:{
        initialValue:this.state.params.cabinAddr
      },
    };
    // 编辑赋值
    return (
      <div>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.main-nvr'})}
          >
            {getFieldDecorator('mainHookNvrId', formRules.mainHookNvrId)(
              <Select placeholder={formatMessage({id:'app.common.select'})} onChange={this.change} showSearch filterOption = {this.filter}>
                {models}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.main-channel'})}
          >
            {getFieldDecorator('mainHookChannel', formRules.mainHookChannel)(
              <Input  onBlur={this.handleConfirmMainHook} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.main-address'})}
          >
            {getFieldDecorator('mainHookAddr', formRules.mainHookAddr)(
              <Search
                enterButton={formatMessage({id:'app.nvr.get-address'})}
                onSearch={() => this.getSingleAddress(1)}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.jib-nvr'})}
          >
            {getFieldDecorator('jibNvrId', formRules.jibNvrId)(
              <Select placeholder={formatMessage({id:'app.common.select'})} onChange={this.changeJib} showSearch filterOption = {this.filter}>
                {models}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.jib-channel'})}
          >
            {getFieldDecorator('jibChannel', formRules.jibChannel)(
              <Input onBlur={this.handleConfirmJib}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.jib-address'})}
          >
            {getFieldDecorator('jibAddr', formRules.jibAddr)(
              <Search
                enterButton={formatMessage({id:'app.nvr.get-address'})}
                onSearch={() => this.getSingleAddress(2)}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.balance-nvr'})}
          >
            {getFieldDecorator('balanceNvrId', formRules.balanceNvrId)(
              <Select placeholder={formatMessage({id:'app.common.select'})} onChange={this.changeBalance} showSearch filterOption = {this.filter}>
                {models}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.balance-channel'})}
          >
            {getFieldDecorator('balanceChannel', formRules.balanceChannel)(
              <Input onBlur={this.handleConfirmBalance} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.balance-address'})}
          >
            {getFieldDecorator('balanceAddr', formRules.balanceAddr)(
              <Search
                enterButton={formatMessage({id:'app.nvr.get-address'})}
                onSearch={() => this.getSingleAddress(3)}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.cabin-nvr'})}
          >
            {getFieldDecorator('cabinNvrId', formRules.cabinNvrId)(
              <Select placeholder={formatMessage({id:'app.common.select'})} onChange={this.changeCabin} showSearch filterOption = {this.filter}>
                {models}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.cabin-channel'})}
          >
            {getFieldDecorator('cabinChannel', formRules.cabinChannel)(
              <Input onBlur={this.handleConfirmCabin}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.nvr.cabin-address'})}
          >
            {getFieldDecorator('cabinAddr', formRules.cabinAddr)(
              <Search
                enterButton={formatMessage({id:'app.nvr.get-address'})}
                onSearch={() => this.getSingleAddress(4)}
              />
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }
};
export default BindNvr;
