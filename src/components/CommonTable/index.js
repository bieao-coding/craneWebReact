/*eslint-disable*/
import React, {PureComponent} from 'react';
import {Table,Card,Form,Pagination,Row,Col,Input,Button} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;

class CommonTable extends PureComponent{
  constructor(props){
    super(props);
    this.state = {
      searchValue:''
    }
  }
  /*页码改变*/
  onePageChange = (page,pageSize) => {
    const {onChange} = this.props;
    if(onChange){
      onChange(page,pageSize);
    }
  };
  /*页数改变*/
  onSizeChange = (current, size) => {
    const {onChange} = this.props;
    if(onChange){
      onChange(1,size);
    }
  };
  render(){
    const {rowKey,list,columns,loading,currentPage,total,rowSelection,scroll,className,noChangeSize,expandedRowRender,pageSize = 10}  = this.props;
    return (
      <div>
        <Table
          size = 'middle'
          rowKey = {rowKey}
          pagination = {false}
          dataSource={list}
          columns={columns}
          loading={loading}
          rowSelection = {rowSelection}
          expandedRowRender={expandedRowRender}
          scroll = {!!scroll ? scroll : {x:0}}
          className={className}
        />
        <Row className = 'm-t-10' type="flex" justify="space-between" align="middle">
          <Col>
            <span>
              <FormattedMessage
                id="app.common.total"
                values={{ total: total }}
              />
            </span>
          </Col>
          <Col>
            <Pagination showSizeChanger = {!noChangeSize} pageSize = {pageSize} onChange={this.onePageChange} onShowSizeChange={this.onSizeChange} current={currentPage} total={total} />
          </Col>
        </Row>
      </div>
    );
  }
}
export default CommonTable;
