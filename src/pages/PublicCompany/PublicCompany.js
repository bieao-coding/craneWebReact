/*eslint-disable*/
// 处理左边树，查询展示公司和工程
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {Form,Card,Row,Col,Button,Input,Tag} from 'antd';
import CommonTable from '@/components/CommonTable';
@connect(({ publicCompany,loading }) => ({
  publicCompany,
  loading: loading.effects['publicCompany/getContents'],
}))
class PublicCompany extends Component {
  state = {
    params:{
      search:'',
      pageNumber:0,
      pageSize:10,
    },
    list:[],
    total:0,
    rowKey:'index',
    companyPlaceholder:formatMessage({id:'app.common.companyName'}),
    projectPlaceholder:formatMessage({id:'app.common.projectName'}),
  };
  companyColumns = [
    {
      title: formatMessage({id:'app.common.companyName'}),
      dataIndex: 'companyName',
    },
    {
      title: formatMessage({id:'app.company.manager'}),
      dataIndex: 'manager',
    },
    {
      title: formatMessage({id:'app.company.businessLevel'}),
      dataIndex: 'businessLevel',
      render: (text, record) => {
        const level = this.showLevel(record.businessLevel);
        return (
          <Fragment>
            <Tag color={level.color}>{level.msg}</Tag>
          </Fragment>
        )
      },
    },
    {
      title: formatMessage({id:'app.common.phone'}),
      dataIndex: 'telephone',
    },
  ];
  /*工程列名*/
  projectColumns = [
    {
      title: formatMessage({id:'app.common.projectName'}),
      dataIndex: 'projectName',
    },
    {
      title: formatMessage({id:'app.common.workCompany'}),
      dataIndex: 'workCompanyName',
      render: (text, record) => (
        !!record.workCompanyName ? (
          <Fragment>
            <Tag color='green'>{record.workCompanyName}</Tag>
          </Fragment>
        ):(<Fragment></Fragment>)
      )
    },
    {
      title: formatMessage({id:'app.common.buildCompany'}),
      dataIndex: 'buildCompanyName',
      render: (text, record) => (
        !!record.buildCompanyName ? (
          <Fragment>
            <Tag color='blue'>{record.buildCompanyName}</Tag>
          </Fragment>
        ):(<Fragment></Fragment>)
      )
    },
    {
      title: formatMessage({id:'app.common.supervisionCompany'}),
      dataIndex: 'supervisionCompanyName',
      render: (text, record) => (
        !!record.supervisionCompanyName ? (
          <Fragment>
            <Tag color='magenta'>{record.supervisionCompanyName}</Tag>
          </Fragment>
        ):(<Fragment></Fragment>)
      )
    },
    {
      title: formatMessage({id:'app.common.status'}),
      dataIndex: 'status',
      align:'center',
      render: (text, record) => (
        <Fragment>
          <Tag color={!record.status ? 'orange' : ((record.status === 1) ? 'magenta':'green')}>{!record.status ? formatMessage({id:'app.common.processing'}) : ((record.status === 1) ? formatMessage({id:'app.common.shut-down'}):formatMessage({id:'app.common.finish'}))}</Tag>
        </Fragment>
      ),
    }
  ];
  
  /*DOM加载完成后执行*/
  componentDidMount() {
    const location = this.props.location.state;
    if(location){
      this.setState({type:location.type,id:location.id,businessType:location.businessType},()=>{
        this.getList();
      })
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(!currentState || nextState.id !== currentState.id){
      this.setState({type:nextState.type,id:nextState.id,businessType:nextState.businessType,params:{ search:'', pageNumber:0, pageSize:10}},()=>{
        this.getList();
      })
    }
  }
  /*请求事件*/
  getList = () => {
    const { dispatch,publicCompany } = this.props;
    const {type,params,id,businessType} = this.state;
    const {pageNumber = 0, pageSize = 10} = (publicCompany.pageObj)[id] || {};
    const paramsPage = {...params,...{pageNumber,pageSize}};
    this.setState({params:paramsPage});
    let newParam = {};
    if(type){
      newParam = {...paramsPage,...{companyId:id,businessType:businessType}};
    }else{
      newParam = {...paramsPage,...{companyId:id,businessType:businessType}}
    }
    dispatch({
      type: 'publicCompany/getContents',
      payload:{type:type,params:newParam},
      callback:(res)=>{
        const newlist = res.list.map((item,index)=>{
          return {...item,...{index:index}}
        });
        this.setState({list:newlist,total:res.total});
      }
    });
  };
  /*页码改变事件*/
  onPageChange = (page, pageSize) =>{
    const obj = {...this.state.params,...{pageNumber:page - 1,pageSize}};
    this.setState({
      params:obj
    },()=>{
      this.getList();
    });
    const {pageObj} = this.props.publicCompany;
    const {id} = this.state;
    pageObj[id] = {pageNumber:page - 1,pageSize};
    this.props.dispatch({
      type: 'publicCompany/setPage',
      payload:pageObj
    })
  };
  /*查询值更改*/
  searchChange = (e) =>{
    this.setState({
      params:{...this.state.params,...{search:e.target.value}}
    });
  };
  /*查询事件*/
  search = (e) => {
    e.preventDefault();
    const {pageObj} = this.props.publicCompany;
    const {id} = this.state;
    pageObj[id] = {pageNumber:0};
    this.props.dispatch({
      type: 'publicCompany/setPage',
      payload:pageObj
    });
    this.setState({
      params:{...this.state.params,...{pageNumber:0}}
    },()=>{
      this.getList();
    });

  };
  /*显示等级*/
  showLevel = (level) =>{
    switch(level){
      case 1:
        return {msg:formatMessage({id:'app.company.first-company'}),color:'green'};
        break;
      case 2:
        return {msg:formatMessage({id:'app.company.two-company'}),color:'cyan'};
        break;
      case 3:
        return {msg:formatMessage({id:'app.company.three-company'}),color:'blue'};
        break;
      case 4:
        return {msg:formatMessage({id:'app.company.four-company'}),color:'geekblue'};
        break;
      case 5:
        return {msg:formatMessage({id:'app.company.five-company'}),color:'purple'};
        break;
      default:
        return {msg:formatMessage({id:'app.company.noExist-company'}),color:'magenta'};
        break;
    }
  };
  render() {
    const {loading} = this.props;
    const {params,type,rowKey,companyPlaceholder,projectPlaceholder,list,total} = this.state;
    return (
      <div className='p-l-10' id='content'>
        <Form onSubmit={this.search} layout="inline">
          <Row gutter={{ md:8,sm:8,xs: 8 }} className = 'm-b-10'>
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {type ? projectPlaceholder : companyPlaceholder} value={params.search} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="space-between">
                <Button type="primary" icon="search" htmlType="submit">
                  <FormattedMessage id='app.common.search' />
                </Button>
              </Row>
            </Col>
          </Row>
        </Form>
        <div>
          {type ? (
            <CommonTable
              loading={loading}
              list = {list}
              rowKey = {rowKey}
              columns = {this.projectColumns}
              total = {total}
              currentPage = {params.pageNumber + 1}
              pageSize = {params.pageSize}
              onChange = {this.onPageChange}
            />
          ):(
            <CommonTable
              loading={loading}
              list = {list}
              rowKey = {rowKey}
              columns = {this.companyColumns}
              total = {total}
              currentPage = {params.pageNumber + 1}
              pageSize = {params.pageSize}
              onChange = {this.onPageChange}
            />
          )}
        </div>
      </div>
    );
  }
}

export default PublicCompany;
