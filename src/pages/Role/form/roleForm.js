/*eslint-disable*/
import React, {Component, Fragment} from 'react';
import { Form, Input,Card,Button } from 'antd';
import {connect} from "dva/index";
import { formatMessage, FormattedMessage } from 'umi/locale';
import {resMessage} from '@/utils/utils'
const FormItem = Form.Item;
const {TextArea}  = Input;
@connect(({ role, loading }) => ({
  role,
  loading: loading.effects['role/getEdit'],
}))
@Form.create()
class RoleForm extends Component {
    state = {
      loading:false,
      params:{
        roleId:null,
        roleName:null,
        description:null
      }
    };
    // /*DOM加载完成后执行*/
    componentDidMount() {
      const params = this.props.location.state;
      if(params && params.roleId){
        this.setState({id:params.roleId},()=>{
          this.getEditData();
        });
      }
    }
    /*获取单项数据*/
    getEditData = () => {
      this.props.dispatch({
        type: 'role/getEdit',
        payload:this.state.id,
        callback:(data)=>{
          this.setState({params:data});
        }
      })
    };
    // /*保存*/
    handleSubmit = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (err) return;
        this.setState({loading:true});
        this.props.dispatch({
          type: !!this.state.params.roleId ? 'role/edit' : 'role/add',
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
        roleName:{
          rules:[{required: true,whitespace:true, message: formatMessage({id:'app.common.require-value'})}],
          initialValue:this.state.params.roleName
        },
        description:{
          initialValue:this.state.params.description
        }
      };
      // 编辑赋值
      return (
        <Card>
          <Form onSubmit={this.handleSubmit} >
            <FormItem
              {...formItemLayout}
              label={<FormattedMessage id='app.role.roleName' />}
            >
              {getFieldDecorator('roleName', formRules.roleName)(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<FormattedMessage id='app.common.description' />}
            >
              {getFieldDecorator('description', formRules.description)(
                <TextArea rows={3}/>
              )}
            </FormItem>
            <FormItem {...tailFormItemLayout} className='m-b-0'>
              <Button type="primary" htmlType="submit" loading = {this.state.loading}>
                <FormattedMessage id='app.common.save' />
              </Button>
            </FormItem>
          </Form>
        </Card>
      )
    }
  };
export default RoleForm;
