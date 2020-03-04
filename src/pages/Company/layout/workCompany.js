/*eslint-disable*/
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {resMessage,transPingTreeToChildren,recursionTopToObj} from '@/utils/utils'
import {Divider, Popconfirm, message, Form, Card, Row, Col, Button, Input, Tag, Table, Tree} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

@connect(({ company,user, loading }) => ({
  company,
  auth:user.authorization,
  loading: loading.effects['company/fetch'],
}))
class WorkCompany extends Component {
  state = {
    filterList:[],
    rowKey:'companyId',
    placeHolder:formatMessage({id:'app.common.companyName'}),
    expandKeys:[]
  };
  list = [];
  oldList = [];
  /*列名*/
  columns = [
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
    {
      title:  formatMessage({id:'app.common.options'}),
      render: (text, record) => (
        <Fragment>
          {this.props.auth.workCompany_edit ? (
            <Fragment>
              <a href = 'javascript:void(0)' className='m-r-10' onClick={() => this.addAndEdit(2,record)}>
                <FormattedMessage id='app.common.edit' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
          {this.props.auth.workCompany_addNext ? (
            <Fragment>
              <a href = 'javascript:void(0)' disabled={record.businessLevel >= 5} onClick={() => this.addAndEdit(1,record)}>
                <FormattedMessage id='app.common.addNext' />
              </a>
            </Fragment>
          ):(<Fragment></Fragment>)}
        </Fragment>
      ),
    },
  ];

  /*DOM加载完成后执行*/
  componentDidMount() {
    this.getList();
  }
  /*请求事件*/
  getList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/fetch',
      payload:{businessType:1},
      callback:(res)=>{
        this.oldList = JSON.parse(JSON.stringify(res));
        const list = transPingTreeToChildren({id:'companyId',pid:'parentCompanyId',children:'children'},res);
        this.list = list;
        this.setState({filterList:list});
      }
    });
  };
  /*查询值更改*/
  searchChange = (e) =>{
    const value = e.target.value;
    let newList = this.list,expandKeys = [];
    if(!!value){
      const res = recursionTopToObj(newList,newList,'companyName','companyId','parentCompanyId',value,false,null,[]);
      const newArray = [],obj = [];
      expandKeys = res;
      for(const index of res){
        if(!newArray.includes(index)){
          newArray.push(index);
          obj.push(this.oldList.filter((item)=>{return item.companyId === index})[0])
        }
      }
      const newObj = JSON.parse(JSON.stringify(obj));
      newList = transPingTreeToChildren({id:'companyId',pid:'parentCompanyId',children:'children'},newObj);
    }
    this.setState({filterList:newList},()=>{this.setState({expandKeys:expandKeys})})
    this.props.dispatch({
      type: 'company/setPage',
      payload:{pageNumber:0}
    })
  };
  /*新增*/
  addAndEdit = (type,record) => {
    const obj = {};
    obj.businessType = 1;
    if(!type){
      obj.parentId = null;
      obj.businessLevel = 1;
      router.push({
        pathname:'/base/company/workCompany/add',
        state:obj
      });
    } else if (type === 1){
      obj.parentId = record.companyId;
      obj.businessLevel = record.businessLevel + 1;
      router.push({
        pathname:'/base/company/workCompany/addNext',
        state:obj
      });
    }else{
      obj.companyId = record.companyId;
      router.push({
        pathname:'/base/company/workCompany/edit',
        state:obj
      });
    }
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
  expand = (expandRowKeys) => {
    this.setState({expandKeys:expandRowKeys})
  };
  onChange = (pagination) => {
    const {current} = pagination;
    this.props.dispatch({
      type: 'company/setPage',
      payload:{workPageNumber:current}
    })
  };
  render() {
    const {rowKey,filterList,expandKeys} = this.state;
    const {workPageNumber = 0} = this.props.company;
    const {loading} = this.props;
    return (
      <div>
        <Form layout="inline" className = 'm-b-10'>
          <Row gutter={{ md:8,sm:8,xs: 8 }} >
            <Col xxl = {5} xl = {6} lg ={7} xs = {8}>
              <Input placeholder = {this.state.placeHolder} onChange={this.searchChange}/>
            </Col>
            <Col xxl = {19} xl = {18} lg ={17} xs = {16}>
              <Row type="flex" justify="end">
                {this.props.auth.workCompany_add ? (
                  <Button type="primary" icon="plus" onClick={() => this.addAndEdit(0)}>
                    <FormattedMessage id='app.common.add' />
                  </Button>
                ):(<Fragment></Fragment>)}
              </Row>
            </Col>
          </Row>
        </Form>
        <Table
          expandedRowKeys={expandKeys}
          onExpandedRowsChange={this.expand}
          loading={loading}
          pagination = {{current:workPageNumber}}
          onChange = {this.onChange}
          dataSource = {filterList}
          rowKey = {rowKey}
          columns = {this.columns}
        />
      </div>
    );
  }
}

export default WorkCompany;
