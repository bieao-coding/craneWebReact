/*eslint-disable*/
import React, { Component,Fragment } from 'react';
import { Form, Input,Card,Button,Select,Cascader  } from 'antd';
import {connect} from "dva/index";
import {resMessage,transPingTreeToChildren,recursionTopToKey} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import infoTwo from '@/defaultInfo';
import singapore from '@/assets/json/singapore.json';
import styles from './projectForm.less'
import $ from 'jquery'
import info from '@/assets/json/info';
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ project, loading }) => ({
  project,
  loading: loading.effects['project/getEdit'],
}))
@Form.create()
class ProjectForm extends Component {
  index = 0;
  state = {
    loading:false,
    position:{},
    workCompanies:[],
    buildCompanies:[],
    supervisionCompanies:[],
    params:{
      projectId:null,
      projectName:null,
      workPermit:null,
      mecManTel:null,
      mecManager:null,
      safetyDirector:null,
      safetyDirTel:null,
      location:null,
      address:null,
      status:0,
      workCompanyId:null,
      buildCompanyId:null,
      supervisionCompanyId:null,
    },
  };
  // /*DOM加载完成后执行*/
  componentDidMount() {
    this.divClick();
    this.getWorkCompanies();
  }

  /*获取单项数据*/
  getEditData = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'project/getEdit',
      payload:this.state.id,
      callback:(res)=>{
        const {workCompanies,buildCompanies,supervisionCompanies} = this.state;
        const array1 = !!res.workCompanyId ? recursionTopToKey(workCompanies,'companyId','companyId',res.workCompanyId).reverse() : null;
        const array2 = !!res.buildCompanyId ? recursionTopToKey(buildCompanies,'companyId','companyId',res.buildCompanyId).reverse() : null;
        const array3 = !!res.supervisionCompanyId ? recursionTopToKey(supervisionCompanies,'companyId','companyId',res.supervisionCompanyId).reverse() : null;
        const address = !!res.address ? res.address.split(',') : '';
        const params = {...res,...{address:address,buildCompanyId:array2,supervisionCompanyId:array3,workCompanyId:array1}};
        this.setState({params:params});
      }
    })
  };
  /*递归查找选中项*/
  findSelect = (data,id) => {
    let ids = [];
    for(const item of data){
      if(item.children){
        ids = this.findSelect(item.children,id);
        if(ids.length){
          ids.push(item.companyId);
          break;
        }
      }else{
        if(item.companyId === id){
          ids.push(item.companyId);
          break;
        }
      }
    }
    return ids
  };
  /*获取施工单位*/
  getWorkCompanies = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'project/getCompanies',
      payload:{businessType:1},
      callback:(res)=>{
        res && this.resolveCompanies(res,1);
        this.getBuildCompanies();
      }
    })
  };
  /*获取建设单位*/
  getBuildCompanies = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'project/getCompanies',
      payload:{businessType:2},
      callback:(res)=>{
        res && this.resolveCompanies(res,2);
        this.getSupervisionCompanies();
      }
    })
  };
  /*获取监理单位*/
  getSupervisionCompanies = () => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'project/getCompanies',
      payload:{businessType:3},
      callback:(res)=>{
        res && this.resolveCompanies(res,3);
        const params = this.props.location.state;
        if(params && params.projectId){
          this.setState({id:params.projectId},()=>{
            this.getEditData();
          });
        }
      }
    })
  };
  /*将单位分类*/
  resolveCompanies(res,type){
    const list = transPingTreeToChildren({id:'companyId',pid:'parentCompanyId',children:'children'},res,{name:['value','label'],value:['companyId','companyName']});
    switch(type){
      case 1:
        this.setState({workCompanies:list});
        break;
      case 2:
        this.setState({buildCompanies:list});
        break;
      case 3:
        this.setState({supervisionCompanies:list});
        break;
    }
  };
  /*过滤施工单位*/
  filter = (inputValue, path) => {
    return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
  };
  /*保存*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({loading:true});
      const companyId = values.workCompanyId ? values.workCompanyId[values.workCompanyId.length - 1] : null;
      const buildId = values.buildCompanyId ? values.buildCompanyId[values.buildCompanyId.length - 1] : null;
      const supervisionId = values.supervisionCompanyId ? values.supervisionCompanyId[values.supervisionCompanyId.length - 1] : null;
      const address = values.address ? values.address.join() : null;
      const params = {...values,...{workCompanyId:companyId,address:address,buildCompanyId:buildId,supervisionCompanyId:supervisionId}};
      this.props.dispatch({
        type: !!this.state.params.projectId ? 'project/edit' : 'project/add',
        payload:{...this.state.params,...params},
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
  /*document事件*/
  divClick = () => {
    $('#location').click(()=>{
      window.event? window.event.cancelBubble = true : e.stopPropagation();
      const self = this;
      const location = this.props.form.getFieldValue('location');
      $('#map').show();
      this.map = new BMap.Map('map');
      this.map.enableDragging();
      this.map.enableScrollWheelZoom();
      const lngLat = infoTwo.isSingapore ? [103.793719,1.354014] : [108.953562, 34.265588];
      let point = new BMap.Point(...lngLat);
      if(!!location){
        const locationArr = location.split(',');
        point = new BMap.Point(locationArr[0], locationArr[1]);
        self.setMap(point);
      }
      this.map.centerAndZoom(point, 12);
      this.map.addEventListener("click",function(e){
        self.setMap(new BMap.Point(e.point.lng, e.point.lat));
        self.props.form.setFieldsValue({location:`${e.point.lng},${e.point.lat}`})
      });
    });
    $(document).click(()=>{
      if($('#map').css('display') === 'block'){
        $('#map').hide()
      }
    });
    $('#map').click(()=>{
      window.event? window.event.cancelBubble = true : e.stopPropagation();
    })
  };
  setMap(point){
    this.map.clearOverlays();
    const marker = new BMap.Marker(point);
    this.map.addOverlay(marker);
    marker.setAnimation(BMAP_ANIMATION_BOUNCE);
  }

  changeAddress = (info) => {
    this.setState({params:{...this.state.params,...{address:info.join()}}})
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
      projectName:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.projectName
      },
      workPermit:{
        initialValue:this.state.params.workPermit
      },
      mecManager:{
        initialValue:this.state.params.mecManager
      },
      mecManTel:{
        rules:[{pattern:infoTwo.isSingapore ? new RegExp(/^\+65\d{8}$/):new RegExp(/(^(1[3-9][0-9])\d{8}$)|(^(0\d{2}-\d{8}(-\d{1,4})?)|(0\d{3}-\d{7,8}(-\d{1,4})?)$)/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.mecManTel
      },
      safetyDirector:{
        initialValue:this.state.params.safetyDirector
      },
      safetyDirTel:{
        rules:[{pattern:infoTwo.isSingapore ? new RegExp(/^\+65\d{8}$/):new RegExp(/(^(1[3-9][0-9])\d{8}$)|(^(0\d{2}-\d{8}(-\d{1,4})?)|(0\d{3}-\d{7,8}(-\d{1,4})?)$)/), message: formatMessage({id:'app.common.legal-value'})}],
        initialValue:this.state.params.safetyDirTel
      },
      workCompanyId:{
        rules:[{required: true, message: formatMessage({id:'app.common.require-value'})}],
        initialValue:this.state.params.workCompanyId
      },
      buildCompanyId:{
        initialValue:this.state.params.buildCompanyId
      },
      supervisionCompanyId:{
        initialValue:this.state.params.supervisionCompanyId
      },
      address:{
        initialValue:this.state.params.address
      },
      location:{
        initialValue:this.state.params.location
      },
      status:{
        initialValue:this.state.params.status
      },
    };
    const {workCompanies,buildCompanies,supervisionCompanies,params} = this.state;
    return (
      <Card>
        <Form onSubmit={this.handleSubmit} >
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.projectName'})}
          >
            {getFieldDecorator('projectName', formRules.projectName)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.workCompany'})}
          >
            {getFieldDecorator('workCompanyId', formRules.workCompanyId)(
              <Cascader disabled={!!params.workCompanyId} options={workCompanies} placeholder={formatMessage({id:'app.common.select'})} showSearch={this.filter}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.buildCompany'})}
          >
            {getFieldDecorator('buildCompanyId', formRules.buildCompanyId)(
              <Cascader disabled={!!params.buildCompanyId} options={buildCompanies} placeholder={formatMessage({id:'app.common.select'})} showSearch={this.filter}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.supervisionCompany'})}
          >
            {getFieldDecorator('supervisionCompanyId', formRules.supervisionCompanyId)(
              <Cascader disabled={!!params.supervisionCompanyId} options={supervisionCompanies} placeholder={formatMessage({id:'app.common.select'})} showSearch={this.filter}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.mecManager'})}
          >
            {getFieldDecorator('mecManager', formRules.mecManager)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.mecManTel'})}
          >
            {getFieldDecorator('mecManTel', formRules.mecManTel)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.safetyDirector'})}
          >
            {getFieldDecorator('safetyDirector', formRules.safetyDirector)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.safetyDirTel'})}
          >
            {getFieldDecorator('safetyDirTel', formRules.safetyDirTel)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.workPermit'})}
          >
            {getFieldDecorator('workPermit', formRules.workPermit)(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.address'})}
          >
            {getFieldDecorator('address', formRules.address)(
              <Cascader allowClear={false} onChange={this.changeAddress} options={infoTwo.isSingapore ? singapore : info} placeholder={formatMessage({id:'app.common.select'})} showSearch={this.filter}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.project.location'})}
          >
            {getFieldDecorator('location', formRules.location)(
              <Input id = "location" readOnly={true}/>
            )}
            <div id="map" className = {styles.map}>
              {/*<Map amapkey={'2e9c6bfb457e3bfae632c5984b196133'} events={events} zoom={9} center={position}>*/}
              {/*  <Marker position={position} />*/}
              {/*</Map>*/}
            </div>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={formatMessage({id:'app.common.status'})}
          >
            {getFieldDecorator('status', formRules.status)(
              <Select>
                <Option value={0}><FormattedMessage id='app.common.processing' /></Option>
                <Option value={1}><FormattedMessage id='app.common.shut-down' /></Option>
                <Option value={2}><FormattedMessage id='app.common.finish' /></Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout} className='m-b-10'>
            <Button type="primary" htmlType="submit" loading = {this.state.loading}>
              <FormattedMessage id='app.common.save' />
            </Button>
          </FormItem>
        </Form>
      </Card>
    )
  }
};
export default ProjectForm;
