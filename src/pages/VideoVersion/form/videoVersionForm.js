/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input,Card,Button,Upload,Icon } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {connect} from "dva/index";
import {resMessage} from '@/utils/utils'
import styles from './videoVersionForm.less';

const {TextArea}  = Input;
const FormItem = Form.Item;
@connect(({}) => ({
}))
@Form.create()
class VideoVersionForm extends Component {
  state = {
    loading:false,
    tgzFileList:[],
    MD5FileList:[],
    params:{
      versionName:null,
      file:null,
      checkFile:null,
      description:null
    },
    auth:{}
  };
  /*DOM加载完成后执行*/
  componentDidMount() {

  }

  // /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      const formData = new FormData();
      formData.append('versionName',values.versionName);
      formData.append('file',values.file);
      formData.append('checkFile',values.checkFile);
      formData.append('description',values.description);
      this.props.dispatch({
        type: 'videoVersion/add',
        payload:formData,
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
  /*校验文件格式*/
  fileChange(mark,file){
    let fileName = file.file.name;
    let nameIndex = fileName.lastIndexOf('.');
    let suffixName = fileName.substring(nameIndex + 1);
    if(mark === 'tgz'){
      if(suffixName === 'tgz'){
        this.setState({
          tgzFileList:[file.fileList[file.fileList.length - 1]]
        });
        this.props.form.setFieldsValue({
          versionName: `${fileName.substring(0,nameIndex)}`
        });
      }else{
        this.setState({
          fileList:[]
        });
        this.props.form.setFieldsValue({
          softwareName: null
        });
      }
    }else{
      if(suffixName === 'MD5' || 'md5'){
        this.setState({
          MD5FileList:[file.fileList[file.fileList.length - 1]]
        });
      }else{
        this.setState({
          fileList:[]
        });
      }
    }
  };
  normFile(mark,e) {
    let fileName = e.file.name;
    let nameIndex = fileName.lastIndexOf('.');
    let suffixName = fileName.substring(nameIndex + 1);
    if(suffixName.toLowerCase() === mark.toLowerCase()){
      return e.file;
    }else{
      return null;
    }
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
      file:{
        rules:[{required:true, message: formatMessage({id:'app.device.TGZ-file'})}],
        getValueFromEvent: (e) => this.normFile('tgz',e),
      },
      checkFile:{
        rules:[{required:true, message: formatMessage({id:'app.device.MD5-file'})}],
        getValueFromEvent: (e) => this.normFile('MD5',e),
      },
      description:{
        initialValue:this.state.params.description
      }
    };
    const props = {
      onRemove: (file) => {
       return false;
      },
      beforeUpload: (file) => {
        return false;
      }
    };
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} className={styles.upFile}>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.device.versionName' />}
          >
            {getFieldDecorator('versionName')(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.device.updateFile' />}
          >
            {getFieldDecorator('file',formRules.file)(
              <Upload {...props} accept = '.tgz'  onChange={(file) => this.fileChange('tgz',file)} fileList={this.state.tgzFileList}>
                <Button >
                  <Icon type="upload" /> <FormattedMessage id='app.device.chooseFile' />
                </Button>
              </Upload>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.device.checkFile' />}
          >
            {getFieldDecorator('checkFile',formRules.checkFile)(
              <Upload {...props} accept = '.MD5,.md5'  onChange={(file) => this.fileChange('MD5',file)} fileList={this.state.MD5FileList}>
                <Button >
                  <Icon type="upload" /> <FormattedMessage id='app.device.chooseFile' />
                </Button>
              </Upload>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id='app.device.description' />}
          >
            {getFieldDecorator('description')(
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
export default VideoVersionForm;
