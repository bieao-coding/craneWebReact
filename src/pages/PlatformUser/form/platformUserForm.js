/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input,Card,Button,Select,Cascader  } from 'antd';
import {connect} from "dva/index";
import {resMessage,transPingTreeToChildren} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import info from '@/defaultInfo';
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ platformUser,user }) => ({
  platformUser,
  userInfo:user.currentUser,
}))
@Form.create()
class PlatformUserForm extends Component {
  state = {
    loading:false,
    position:{},
    originalRoles:[],
    roles:[],
    params:{
      userId:null,
      roleId:null,
      username:null,
      realName:null,
      idCard:null,
      email:null,
      telephone:null,
      status:0,
      sex:0,
      parentUserId:null
    }
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    const params = this.props.location.state;
    this.getAllRoles();
    if(params){
      if(params.userId){
        this.setState({id:params.userId},()=>{
          this.getEditData();
        });
      }else{
        this.setState({params:{...this.state.params,...{parentUserId:params.parentUserId}}});
      }
    }
  }
  /*获取单项数据*/
  getEditData = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'platformUser/getEdit',
      payload:this.state.id,
      callback:(res)=>{
        this.setState({params:res});
      }
    })
  };
  /*获取所有角色*/
  getAllRoles = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'platformUser/getRoles',
      payload:{queryType:1},
      callback:(res)=>{
        const {userId} = this.props.userInfo;
        let newList = res.list;
        if(userId != 1){
          newList = res.list.filter((item)=>{
              return item.roleId != 1;
          });
        }
        this.setState({originalRoles:newList});
        res && this.resolveRoles(newList);
      }
    })
  };
  /*处理角色*/
  resolveRoles = (res) => {
    const optionRole = res.map((item)=>{
      return <Option value={item.roleId} key={item.roleId}>{item.roleName}</Option>
    });
    this.setState({roles:optionRole})
  };
  /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      this.props.dispatch({
        type: !!this.state.params.userId ? 'platformUser/edit' : 'platformUser/add',
        payload:{...this.state.params,...values},
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
  filter = (inputValue, path) => {
    return path.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };
  /*渲染*/
  render() {
    const { getFieldDecorator } = this.props.form;
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
      username:{
        rules:[{required: true, message: formatMessage({id:"app.common.require-value"}),whitespace: true}],
        initialValue:this.state.params.username
      },
      realName:{
        rules:[{required: true, message: formatMessage({id:"app.common.require-value"}),whitespace: true}],
        initialValue:this.state.params.realName
      },
      idCard:{
        rules:[{pattern:new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/), message: formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.idCard
      },
      email:{
        rules:[{pattern:new RegExp(/^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/), message: formatMessage({id:"app.common.legal-value"})}],
        initialValue:this.state.params.email
      },
      telephone:{
        rules:[{pattern:info.isSingapore ? new RegExp(/^\+65\d{8}$/):new RegExp(/(^(1[3-9][0-9])\d{8}$)|(^(0\d{2}-\d{8}(-\d{1,4})?)|(0\d{3}-\d{7,8}(-\d{1,4})?)$)/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.telephone
      },
      roleId:{
        rules:[{required: true, message: formatMessage({id:"app.common.require-value"})}],
        initialValue:this.state.params.roleId
      },
      sex:{
        initialValue:this.state.params.sex
      },
      status:{
        initialValue:this.state.params.status
      },
    };
    const {params,roles} = this.state;
    const {userId} = params;
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.user.loginName'/>}
          >
            {getFieldDecorator('username', formRules.username)(
              <Input disabled={!!userId}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.user.realName'/>}
          >
            {getFieldDecorator('realName', formRules.realName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.idCard'/>}
          >
            {getFieldDecorator('idCard', formRules.idCard)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.email'/>}
          >
            {getFieldDecorator('email', formRules.email)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.phone'/>}
          >
            {getFieldDecorator('telephone', formRules.telephone)(
              <Input/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.user.roleName'/>}
          >
            {getFieldDecorator('roleId', formRules.roleId)(
              <Select placeholder={<FormattedMessage id='app.common.select'/>} showSearch filterOption = {this.filter}>{roles}</Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.sex'/>}
          >
            {getFieldDecorator('sex', formRules.sex)(
              <Select placeholder={<FormattedMessage id='app.common.select'/>}>
                <Option value={0}>{<FormattedMessage id='app.common.man'/>}</Option>
                <Option value={1}>{<FormattedMessage id='app.common.woman'/>}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.common.status'/>}
          >
            {getFieldDecorator('status', formRules.status)(
              <Select>
                <Option value={0}><FormattedMessage id='app.common.enable'/></Option>
                <Option value={1}><FormattedMessage id='app.common.disable'/></Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-0'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save'/>
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default PlatformUserForm;
