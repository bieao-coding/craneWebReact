/*eslint-disable*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Tag, InputNumber, Icon,Button, Upload, message, Slider,Switch,Dropdown,Menu } from 'antd';
import {translateAnglar,resMessage,getBase64} from '@/utils/utils'
import { formatMessage, FormattedMessage } from 'umi/locale';
import * as PIXI from 'pixi.js'
import Animation from '../common/animation2';
import styles from './craneDraggingConfig.less';
const preValue = Math.PI / 180; // 计算弧度制专用
@connect(({ }) => ({

}))
class CraneDraggingConfig extends Component {
  state = {
    clickCrane:{},
    scale:0,
    maxScale:0,
    spreadPicture:null,
    orgPicture:null,
    spreadName:null,
    isTop:true,
  };
  pixi = null;
  projectId = null;
  containerHeight = 0;
  containerWidth = 0;
  cranes = [];
  data = [];
  coordinate = [];
  loopTimer = null;
  fixedPoint = null;
  isFirst = true;
  style = {
    fontFamily: 'Arial',
    fontSize: 12,
    fill: ['#cfb53b'], // gradient
    stroke:'#141e27',
    strokeThickness: 4,
    wordWrap: true,
    wordWrapWidth: 440
  };
  height = 0;
  orgData = {minBorderX:0,minBorderY:0,height:0,width:0};
  clickSelf = null;
  canvasCenterWidth = 0;
  canvasCenterHeight = 0;
  factCenterWidth = 0;
  factCenterHeight = 0;
  bottom = null;
  bottomScale = 0;
  alpha = 0;
  rotation = 0;
  /*DOM加载完成后执行*/
  componentDidMount() {
    const height = window.innerHeight - 50 - 20 - 40 - 38 - 60 - 2 - 53;
    this.height = height > 580 ? height : 580;
    const location = this.props.location.state;
    if(location && location.projectId){
      this.projectId = location.projectId;
      this.initCraneSpread();
      this.getConfig();
    }
  }
  /*属性变化执行*/
  componentWillReceiveProps (nextProps){
    const nextState = nextProps.location.state;
    const currentState = this.props.location.state;
    if(nextState && nextState.projectId !== currentState.projectId){
      this.isFirst = true;
      this.refreshCanvas();
      this.projectId = nextState.projectId;
      this.getConfig();
    }
  }
  /*刷新画布*/
  refreshCanvas() {
    if(this.loopTimer)  clearInterval(this.loopTimer);
    this.pixi.stage.removeChildren();
    this.pixi.render(this.pixi.stage);
    this.pixi.ticker.stop();
    this.bottom = null;
    this.setState({isTop:true})
  }
  /*初始化塔机分布*/
  initCraneSpread = () => {
    const ele = document.getElementById('container');
    const pixi = new PIXI.Application({
      width: ele.offsetWidth,
      height: this.height,
      antialias: true,
      transparent: true
    });
    pixi.interactive = true;
    ele.appendChild(pixi.view);
    this.pixi = pixi;
    this.containerHeight = this.height;
    this.containerWidth = ele.offsetWidth;
  };
  /*请求配置信息*/
  getConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getConfig',
      payload:this.projectId,
      callback:(res)=>{
        const initOk = [];
        const noInit = [];
        this.orgData = res.screenRect;
        res.craneList.forEach((item)=>{
          if(item.initStatus){
            initOk.push(item);
          }else{
            noInit.push(item)
          }
        });
        this.noInitCrane(noInit);
        this.data = initOk;
        if(initOk.length) this.getRunData();
        else this.setState({clickCrane:{}});
      }
    });
  };
  /*未初始化*/
  noInitCrane(data){
    let lastWidth = 0;
    let lastX = this.containerWidth;
    if(data.length) data.unshift({craneNumber:formatMessage({id:'app.monitor.no-init-crane'})});
    data.reverse();
    data.forEach((item,index)=>{
      const richText = new PIXI.Text((index !== data.length - 1 && index) ? item.craneNumber + '、' : item.craneNumber, this.style);
      lastWidth = richText.width;
      richText.x = lastX - lastWidth;
      lastX = richText.x;
      richText.y = 10;
      this.pixi.stage.addChild(richText);
    });
  }
  /*获取实时数据*/
  getRunData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/getRunData',
      payload:this.projectId,
      callback:(res)=>{
        let newData = this.data.map((item)=>{
          res.forEach((a)=>{
            if(item.craneId === a.craneId){
              Object.assign(item,a);
            }
          });
          return item;
        });
        this.data = newData;
        if(this.data.length) this.setState({clickCrane:this.data[0]});
        this.calculate();
      }
    });
  };
  /*将笛卡尔坐标转化为canvas的坐标*/
  calculate = () => {
    const {minBorderX,minBorderY,height,width} = this.orgData;
    let scaleMin = 0;
    const {scale} = this.state;
    if(this.isFirst || !scale){
      this.fixedPoint = {x:minBorderX,y:minBorderY};
      const ruleX = this.containerWidth/width;
      const ruleY = this.containerHeight/height;
      scaleMin = ruleX < ruleY ? ruleX:ruleY;
      scaleMin = Math.floor(scaleMin * 10)/10;
      this.setState({scale:scaleMin,maxScale:scaleMin});
    }else{
      scaleMin = scale;
    }
    this.isFirst = false;
    let coordinate = [];
    this.data.forEach((item)=>{
      const x = (item.screenX - minBorderX) * scaleMin;
      const y = (item.screenY - minBorderY) * scaleMin;
      const arm = item.armLength * scaleMin;
      const balanceArm = item.balanceArmLength * scaleMin;
      const radius = item.radius * scaleMin;
      const rotation = item.screenAngle;
      const craneType = item.craneType;
      const name = item.craneAlias;
      const color = item.isCustom ? '0xffcc00':'0x00ff99';
      coordinate.push({craneId:item.craneId,x:x,y:y,arm:arm,balanceArm:balanceArm,radius:radius,rotation:rotation,craneType:craneType,name:name,color:color,isCustom:item.isCustom});
    });
    this.coordinate = this.resolveCanvas(coordinate,width,height,scaleMin);
    //this.coordinate = coordinate;
    this.initCrane();
    this.loopUpdate();
    this.initAnimate();
  };
  /*画布居中*/
  resolveCanvas(data,width,height,scale){
    this.canvasCenterWidth = this.containerWidth/2;
    this.canvasCenterHeight = this.containerHeight/2;
    this.factCenterWidth = width * scale/2;
    this.factCenterHeight = height * scale/2;
    return data.map((item)=>{
      const diffX = this.canvasCenterWidth + (item.x - this.factCenterWidth);
      const diffY = this.canvasCenterHeight + (item.y - this.factCenterHeight);
      return {...item,...{x:diffX,y:diffY}};
    });
  }
  /*循环画图*/
  initCrane(){
    this.cranes = [];
    this.coordinate.forEach((item)=>{
      const crane = new Animation();
      crane.draw({...item,...{app:this.pixi}});
      this.registerEven(crane,item.isCustom);
      this.cranes.push(crane);
    })
  }
  /*循环更新*/
  loopUpdate(){
    this.coordinate.forEach((item,index)=>{
      this.cranes[index].update(item);
    })
  }
  /*循环动画*/
  initAnimate(){
    this.coordinate.forEach((item,index)=>{
      this.cranes[index].animate();
    })
  }
  /*为每一个塔吊注册点击事件*/
  registerEven(item,isCustom){
    const self = this;
    const itemSelf = item;
    if(isCustom){
      itemSelf.crane.on('pointerdown', function(event){
        const newPosition = event.data.getLocalPosition(this.parent);
        this.data = event.data;
        this.alpha = 0.5;
        itemSelf.richText.alpha = 0;
        itemSelf.car.alpha = 0;
        itemSelf.dash.alpha = 0.5;
        this.dragging = true;
        self.clickSelf = this;
        this.oldPositionX = newPosition.x;
        this.oldPositionY = newPosition.y;
        this.oldCenterX = this.x;
        this.oldCenterY = this.y;
      }).on('pointerup', function(event){
        this.alpha = 1;
        itemSelf.richText.alpha = 1;
        itemSelf.car.alpha = 1;
        itemSelf.dash.alpha = 1;
        this.dragging = false;
        this.data = null;
        self.draggingEnd(self.clickSelf.name,self.clickSelf.x,self.clickSelf.y)
      }).on('pointerupoutside', function(event){
        this.alpha = 1;
        itemSelf.richText.alpha = 1;
        itemSelf.car.alpha = 1;
        itemSelf.dash.alpha = 1;
        this.dragging = false;
        this.data = null;
      }).on('pointermove', function onDragMove() {
        if (this.dragging) {
          const newPosition = this.data.getLocalPosition(this.parent);
          const diffX = newPosition.x - this.oldPositionX;
          const diffY = newPosition.y - this.oldPositionY;
          this.x = this.oldCenterX + diffX;
          this.y = this.oldCenterY + diffY;
          itemSelf.richText.x = this.x;
          itemSelf.richText.y = this.y - 25;
          itemSelf.draggingX = this.x;
          itemSelf.draggingY = this.y;
          itemSelf.dash.x = this.x;
          itemSelf.dash.y = this.y;
        }
      });
    }else{
      itemSelf.crane.on('pointertap',function(){
        const crane = this;
        self.data.forEach((item,index)=>{
          if(crane.name === item.craneAlias){
            self.setState({clickCrane:item})
          }
        })
      });
    }
  }
  /*拖动结束后处理*/
  draggingEnd(craneAlias,canvasX,canvasY){
    const {scale} = this.state;
    if(!this.fixedPoint) return;
    const newCanvasX = canvasX - this.canvasCenterWidth + this.factCenterWidth;
    const newCanvasY = canvasY - this.canvasCenterHeight + this.factCenterHeight;
    const dikerX = (newCanvasX/scale) + this.fixedPoint.x;
    const dikerY = this.fixedPoint.y + (newCanvasY/scale);
    this.data.forEach((item)=>{
      if(item.craneAlias === craneAlias){
        let translation = translateAnglar(dikerX,dikerY,item.a,item.b);
        Object.assign(item,{x:translation[0],y:translation[1]});
        this.setState({clickCrane:{...item,...{x:translation[0],y:translation[1]}}})
      }
    });
  }
  /*处理底图的中心点和宽度*/
  resolveBottom(){
    const {x,y,width,height} = this.bottom;
    const {scale} = this.state;
    const obj = this.data[0];
    if(!this.fixedPoint) return;
    const newCanvasX = x - this.canvasCenterWidth + this.factCenterWidth;
    const newCanvasY = y - this.canvasCenterHeight + this.factCenterHeight;
    const dikerX = (newCanvasX/scale) + this.fixedPoint.x;
    const dikerY = this.fixedPoint.y + (newCanvasY/scale);
    let translation = translateAnglar(dikerX,dikerY,obj.a,obj.b);
    const rateX = width / (this.orgData.width * scale);
    //const rateY = height / (this.orgData.height * scale);
    return {centerX:translation[0],centerY:translation[1],pictureScale:rateX}
  }
  /*比例尺变化*/
  onChange = (value) => {
    this.setState({scale:value});
  };
  /*重新绘制比例*/
  reDraw = () => {
    this.refreshCanvas();
    this.calculate();
  };
  /*保存分布*/
  requestSpread = () => {
    if(!this.data.length){
      message.error(formatMessage({id:'app.monitor.noDataSave'}));
      return;
    }
    const params = [];
    this.data.forEach((item)=>{
      params.push({craneId:item.craneId,a:item.a,b:item.b,x:item.x,y:item.y,isCustom:item.isCustom});
    });
    this.props.dispatch({
      type: 'monitor/saveConfig',
      payload:JSON.stringify(params),
      callback:(res) => {
        resMessage(res);
      }
    })
  };
  requestBottom = () => {
    const {orgPicture,spreadName} = this.state;
    let bottom = {centerX:0,centerY:0,pictureScale:0,alpha:0,angle:0,picture:null,projectId:this.projectId,pictureName:''};
    if(!!this.bottom){
      const result = this.resolveBottom();
      bottom = {...bottom,...result,...{alpha:this.alpha,angle:this.rotation,picture:orgPicture,pictureName:spreadName}}
    }
    const formData = new FormData();
    formData.append('centerX',bottom.centerX);
    formData.append('centerY',bottom.centerY);
    formData.append('pictureScale',bottom.pictureScale);
    formData.append('alpha',bottom.alpha);
    formData.append('angle',bottom.angle);
    formData.append('picture',bottom.picture);
    formData.append('projectId',bottom.projectId);
    formData.append('pictureName',bottom.pictureName);
    this.props.dispatch({
      type: 'monitor/saveBottom',
      payload:formData,
      callback:(res) => {
        resMessage(res);
      }
    })
  };
  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  fileChange = (info) => {
    if (info.file.status === 'done') {
      const fileName = info.file.name.substring(0,info.file.name.indexOf('.'));
      this.getBase64(info.file.originFileObj, imageUrl =>{
        this.resolvePicture(imageUrl,(newImageUrl)=>{
          this.setState({
            spreadPicture:newImageUrl,
            orgPicture:info.file.originFileObj,
            spreadName:fileName + '_' + new Date().getTime()
          },()=>{
            this.addBottom()
          });
        });
      });
    }
  };
  /*处理黑白图*/
  resolvePicture(imageUrl,callback){
    const canvas = document.getElementById('drawing');
    const canvasContext = canvas.getContext('2d');
    const image = new Image();
    image.src = imageUrl;
    image.onload = function(){
      const width = image.width;
      const height = image.height;
      canvas.width = width;
      canvas.height = height;
      canvasContext.drawImage(image, 0, 0);
      const imgPixels = canvasContext.getImageData(0, 0, width, height);
      for(let y = 0; y < imgPixels.height; y++){
        for(let x = 0; x < imgPixels.width; x++){
          let i = (y * 4) * imgPixels.width + x * 4;
          let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
          imgPixels.data[i] = avg;
          imgPixels.data[i + 1] = avg;
          imgPixels.data[i + 2] = avg;
        }
      }
      canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
      callback(canvas.toDataURL())
    };
  }
  /*添加底图*/
  addBottom(){
    const {spreadPicture,spreadName} = this.state;
    if(!!this.bottom) this.transformLevel(false);
    if(!!PIXI.Loader.shared.resources[spreadName]){
      this.bottom = new PIXI.Sprite(PIXI.Loader.shared.resources[spreadName].texture);
      this.setUp()
    }else{
      PIXI.Loader.shared.add(spreadName.toString(),spreadPicture).load(()=>{
        this.bottom = new PIXI.Sprite(PIXI.Loader.shared.resources[spreadName].texture);
        this.setUp()
      })
    }
  }
  setUp(){
    this.bottom.interactive = true;
    this.bottom.buttonMode = true;
    this.bottom.x = this.containerWidth/2;
    this.bottom.y = this.containerHeight/2;
    this.bottom.anchor.set(0.5);
    //this.bottom.scale.set(this.containerWidth/this.bottom.width);
    this.bottom.alpha = 0.1;
    this.registerBottom(this.bottom);
    this.pixi.stage.addChild(this.bottom);
    this.bottomScale = this.containerWidth/this.bottom.width;
    this.alpha = this.bottom.alpha;
    this.setState({isTop:true});
  }
  /*为每一个塔吊注册点击事件*/
  registerBottom(sprite){
    sprite.on('pointerdown', function(event){
      const newPosition = event.data.getLocalPosition(this.parent);
      this.data = event.data;
      this.dragging = true;
      this.oldPositionX = newPosition.x;
      this.oldPositionY = newPosition.y;
      this.oldCenterX = this.x;
      this.oldCenterY = this.y;
    }).on('pointerup', function(event){
      this.dragging = false;
      this.data = null;
    }).on('pointerupoutside', function(event){
      this.dragging = false;
      this.data = null;
    }).on('pointermove', function onDragMove(event) {
      if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        const diffX = newPosition.x - this.oldPositionX;
        const diffY = newPosition.y - this.oldPositionY;
        this.x = this.oldCenterX + diffX;
        this.y = this.oldCenterY + diffY;
      }
    });
  }
  /*底图事件*/
  bottomScaleChange = (value) => {
    if(!this.bottom){
      message.error(formatMessage({id:'app.monitor.bottomNoExisted'}));
      return;
    }
    this.bottomScale = value;
    this.rendererBottom()
  };
  /*底图事件*/
  bottomAlphaChange = (value) => {
    if(!this.bottom){
      message.error(formatMessage({id:'app.monitor.bottomNoExisted'}));
      return;
    }
    this.alpha = value;
    this.rendererBottom()
  };
  bottomRotationChange = (value) => {
    if(!this.bottom){
      message.error(formatMessage({id:'app.monitor.bottomNoExisted'}));
      return;
    }
    this.rotation = value * preValue;
    this.rendererBottom()
  };
  /*改变底图*/
  rendererBottom(){
    this.bottom.scale.set(this.bottomScale);
    this.bottom.alpha = this.alpha;
    this.bottom.rotation = this.rotation;
    this.pixi.renderer.render(this.bottom);
  }
  /*底图置顶*/
  onSwitchChange = (checked) => {
    if(!this.bottom){
      message.error(formatMessage({id:'app.monitor.bottomNoExisted'}));
      return;
    }
    this.setState({isTop:checked},()=>{
      this.transformLevel(true)
    });
  };
  /*切换图层操作*/
  transformLevel(type){
    const {isTop} = this.state;
    const len = this.pixi.stage.children.length;
    if(type){
      if(!isTop){
        this.pixi.stage.removeChildAt(len - 1);
        this.pixi.stage.addChildAt(this.bottom,0);
      }else{
        this.pixi.stage.removeChildAt(0);
        this.pixi.stage.addChildAt(this.bottom,len - 1);
      }
    }else{
      if(isTop){
        this.pixi.stage.removeChildAt(len - 1);
      }else{
        this.pixi.stage.removeChildAt(0);
      }
    }
    this.pixi.render(this.pixi.stage);
  }
  /*卸载*/
  componentWillUnmount(){
    if(this.loopTimer)  clearInterval(this.loopTimer);
    this.pixi.ticker.stop();
  };
  render() {
    const {maxScale,scale,isTop} = this.state;
    const {craneAlias,sn,recordTime,x = 0,y = 0,craneType = 0,armLength = 0,isCustom = 0} = this.state.clickCrane;
    const props = {
      onRemove: () => {
        return false;
      },
      beforeUpload: (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
          message.error(formatMessage({id:'app.monitor.imageError'}));
        }
        const isLt2Kb = file.size / 1024 <= 200;
        if (!isLt2Kb) {
          message.error(formatMessage({id:'app.monitor.imageSize'}));
        }
        return isJpgOrPng && isLt2Kb;
      }
    };
    const menu = (
      <Menu>
        <Menu.Item>
          <a onClick={() => this.requestSpread()}>
            <FormattedMessage id='app.monitor.save-crane'/>
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={() => this.requestBottom()}>
            <FormattedMessage id='app.monitor.save-bottom'/>
          </a>
        </Menu.Item>
      </Menu>
    );

    const marks1 = {
      0.01:{
        style: {
          color: '#fff',
        },
        label: '0.01',
      },
      2:{
        style: {
          color: '#fff',
        },
        label: '2',
      }
    };
    const marks2 = {
      0.01:{
        style: {
          color: '#fff',
        },
        label: '0.01',
      },
      1:{
        style: {
          color: '#fff',
        },
        label: '1',
      }
    };
    const marks3 = {
      0:{
        style: {
          color: '#fff',
        },
        label: '0',
      },
      360:{
        style: {
          color: '#fff',
        },
        label: '360',
      }
    };
    return (
      <Row type='flex' className={styles.dragging}>
        <canvas id='drawing' className='hide'></canvas>
        <Col xxl={18} xl={16} xs={24} className='flex flex-column'>
          <Row>
            <Col className={styles.numberInput} span={24}>
              <div>
                <InputNumber className='m-r-10' min={0} max={maxScale} value={scale} step={0.1} onChange={this.onChange} />
                <Button type="primary" className='m-r-10' onClick={this.reDraw} disabled={!this.data.length}><FormattedMessage id='app.monitor.redraw'/></Button>
              </div>
              <div className='flex'>
                <Upload {...props} onChange={this.fileChange} showUploadList = {false}>
                  <Button type="primary">
                    <Icon type='upload' /> <FormattedMessage id='app.monitor.updateSpread' />
                  </Button>
                </Upload>
                <Dropdown disabled={!this.data.length} overlay={menu} placement='bottomCenter'>
                  <Button className='m-l-10' type='primary' ><FormattedMessage id='app.monitor.save-config'/></Button>
                </Dropdown>
              </div>
            </Col>
          </Row>
          <Row className='auto-flex' id = 'container'/>
        </Col>
        <Col xxl={6} xl={8} xs={0} className={styles.craneInfo}>
          <Row>
            <Row className={styles.title}><FormattedMessage id='app.monitor.crane-info'/></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-name'/></Col><Col span={12}>{craneAlias}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-sn'/></Col><Col span={12}>{sn}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.record-time'/></Col><Col span={12}>{recordTime}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.x'/></Col><Col span={12}>{x.toFixed(1)}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.y'/></Col><Col span={12}>{y.toFixed(1)}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.crane-type'/></Col><Col span={12}>{!craneType ? formatMessage({id:'app.common.flat-crane'}) : craneType === 1 ? formatMessage({id:'app.common.movable-crane'}) : formatMessage({id:'app.common.head-crane'})}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.armLength'/>（m）</Col><Col span={12}>{armLength}</Col></Row>
            <Row className={styles.content}><Col span={12}><FormattedMessage id='app.monitor.isCustom'/></Col><Col span={12}>{!isCustom ? formatMessage({id:'app.common.disable'}) : formatMessage({id:'app.common.enable'})}</Col></Row>
            <Row className={[styles.title,'m-t-10'].join(' ')}><FormattedMessage id='app.monitor.bottom-options'/></Row>
            <Row className={styles.content}>
              <Col span={8}><FormattedMessage id='app.monitor.scale'/></Col>
              <Col span={16}><Slider marks={marks1} step={0.01}  min = {0.01} max = {2}  onAfterChange={(value) => this.bottomScaleChange(value)} /></Col>
            </Row>
            <Row className={styles.content}>
              <Col span={8}><FormattedMessage id='app.monitor.alpha'/></Col>
              <Col span={16}><Slider marks={marks2} step={0.01}  min = {0.01} max = {1}  onAfterChange={(value) => this.bottomAlphaChange(value)} /></Col>
            </Row>
            <Row className={styles.content}>
              <Col span={8}><FormattedMessage id='app.monitor.rotation'/></Col>
              <Col span={16}><Slider marks={marks3} step={1}  min = {0} max = {360}  onAfterChange={(value) => this.bottomRotationChange(value)} /></Col>
            </Row>
            <Row className={styles.content}>
              <Col span={8}><FormattedMessage id='app.monitor.bottom-bottom'/></Col>
              <Col span={16}><Switch checked={isTop} onChange={this.onSwitchChange} /></Col>
            </Row>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default CraneDraggingConfig;
