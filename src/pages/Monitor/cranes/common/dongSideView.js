/*eslint-disable*/
import * as PIXI from 'pixi.js'
import dongCrane from './../../../../assets/images/dongCrane.png'
import line from './../../../../assets/images/line.png'
import hook from './../../../../assets/images/hook.png'
import cargo from './../../../../assets/images/cargo.png'
import arm from './../../../../assets/images/arm.png'
import dongLine from './../../../../assets/images/dongLine.png'
export default class DongSideView{
  sideView = null;
  loader = null;
  Sprite = PIXI.Sprite;
  cargo;//货物
  hook;//吊钩
  dingLine;//顶部卷筒绳子
  line;//吊钩绳子
  arm;//动臂
  oldAnimationData = {lineHeight:0,rotation:0,loadValue:0};//保存之前的数据
  newAnimationData = {lineHeight:0,rotation:0,loadValue:0};//新数据
  lineScale;//塔机比例尺
  armEndMove = 0;
  lineEndMove = 0;
  armMove = 0;//大臂抬起的弧度值
  lineMove = 0;
  lineFlag = false;
  armFlag = false;
  oldCargo = 0;
  cargoValue = 0;
  scale = 1;
  preValue = Math.PI / 180;
  armWidth = 514;
  armHeight = 33;
  dingLineX = 127;//塔机顶部卷筒X
  dingLineY = 403;//塔机顶部卷筒Y
  dingLineArmStart = 68;//卷筒到臂的左边的距离
  armLeftBottomX = 195;//下面已经将左下角设置为圆点，这是该点X
  armLeftBottomY = 516;//下面已经将左下角设置为圆点，这是该点Y
  armAngle = 45;//臂的右下角夹角
  armRightSide = 44;//臂的右边的倾斜边的长度
  dingToArmBottom = 110;//顶部卷筒到臂下缘的距离
  pictureHeight = 882;//塔机+臂垂直时的高度
  armBottomToFool = 361;//塔机臂下边到地面的距离
  foolHeight = 8;//底座的高度
  initAngle = 15;//初始角度是15度
  armHookWidth = 10;//大臂上挂钩的宽度
  armHookHeight = 2;//大臂上挂钩的高度
  hookLineOffsetX = 3;//挂钩相对于绳子需要左移的距离
  cargoLineOffsetX = 9;//重物相对于绳子需要左移的距离
  /*画图*/
  init({towerHeight,scale,loader,sideView,height,elevationAngle,loadValue}) {
    this.sideView = sideView;
    this.loader = loader;
    this.lineScale = this.armBottomToFool/towerHeight;//塔机高度为标准获取 像素/米
    if(!PIXI.utils.TextureCache.dongCrane){
      if(!PIXI.utils.TextureCache.line){
        this.loader
          .add('dongCrane',dongCrane)
          .add('line',line)
          .add('cargo',cargo)
          .add('hook',hook)
          .add('arm',arm)
          .add('dongLine',dongLine)
          .load(()=>{
            this.setUp(height,elevationAngle,loadValue,scale);
          });
      }else{
        this.loader
          .add('dongCrane',dongCrane)
          .add('arm',arm)
          .add('dongLine',dongLine)
          .load(()=>{
            this.setUp(height,elevationAngle,loadValue,scale);
          });
      }
    }else{
      this.setUp(height,elevationAngle,loadValue,scale);
    }
  }
  setUp(height,elevationAngle,loadValue,scale){
    const crane = new this.Sprite(this.loader.resources.dongCrane.texture);
    this.line = new this.Sprite(this.loader.resources.line.texture);
    this.cargo = new this.Sprite(this.loader.resources.cargo.texture);
    this.hook = new this.Sprite(this.loader.resources.hook.texture);
    this.arm = new this.Sprite(this.loader.resources.arm.texture);
    this.dingLine = new this.Sprite(this.loader.resources.dongLine.texture);
    this.line.height = 0;
    crane.position.set(0,this.dingLineY);
    this.arm.position.set(this.armLeftBottomX,this.armLeftBottomY);
    this.arm.anchor.set(0,1);
    this.arm.rotation = -this.preValue * this.initAngle;//初始为0
    /*计算顶部卷筒绳索的x,y方向的值计算需要的绳长以及角度*/
    const self = this;
    const armEndHeight = self.armHeight/Math.cos(-self.arm.rotation);//动臂存在仰角时在臂上的垂直距离
    const rightTopAngle = 90-(180- (90 - this.initAngle) - self.armAngle);//求的右上角的斜边与水平夹角
    const armEndWidth = self.armRightSide * Math.cos(self.preValue * rightTopAngle);//动臂存在仰角时顶部绳结到臂尾的水平距离
    const armNoEndWidth = self.armWidth * Math.cos(-self.arm.rotation) - armEndWidth;//臂左边到顶部绳结的水平距离
    const dingLineWidth = armNoEndWidth + self.dingLineArmStart  + 1;
    const armUpHeight = Math.sin(-self.arm.rotation) * self.armWidth;//臂头抬起的垂直距离
    const armUpWidth = Math.cos(-self.arm.rotation) * self.armWidth;//臂头抬起的水平距离
    const dingLineHeight = self.dingToArmBottom - Math.tan(-self.arm.rotation) * armNoEndWidth - armEndHeight;
    self.dingLine.rotation = Math.atan(dingLineHeight/dingLineWidth);
    self.dingLine.width = Math.sqrt(dingLineWidth * dingLineWidth + dingLineHeight * dingLineHeight);
    //绳子的联动
    self.line.y = self.armLeftBottomY - armUpHeight;
    self.line.x = self.armLeftBottomX + self.armWidth - this.armHookWidth - (self.armWidth - armUpWidth);
    //挂钩
    self.hook.y = self.armLeftBottomY - armUpHeight  + self.line.height;
    self.hook.x = self.armLeftBottomX + self.armWidth - this.armHookWidth - this.hookLineOffsetX - (self.armWidth - armUpWidth);
    this.line.position.set(this.armLeftBottomX + this.armWidth - this.armHookWidth,this.armLeftBottomY - this.armHookHeight);
    this.hook.position.set(this.armLeftBottomX + this.armWidth - this.armHookWidth - this.hookLineOffsetX,this.line.y + this.line.height);
    this.dingLine.position.set(this.dingLineX,this.dingLineY);//塔机顶部卷筒的canvas坐标
    this.cargo.scale.set(0.5,0.5);
    this.cargo.position.set(-100,this.pictureHeight);//初始位置
    const machine = new PIXI.Container();
    machine.addChild(crane);
    machine.addChild(this.arm);
    machine.addChild(this.line);
    machine.addChild(this.dingLine);
    machine.addChild(this.cargo);
    machine.addChild(this.hook);
    machine.scale.set(scale);
    this.sideView.stage.addChild(machine);
    this.oldAnimationData = {lineHeight:0,rotation:this.initAngle,loadValue:0};//初始值绳长使用像素表示
    this.update({height:height,elevationAngle:elevationAngle,loadValue:loadValue});
    this.animation();
  }
  /*动画*/
  animation(){
    const self = this;
    this.sideView.ticker.add(function(delta){
      if(self.armFlag && self.lineFlag){
        self.sideView.ticker.stop();
        self.armFlag = false;
        self.lineFlag = false;
      }else{
        if(self.arm.rotation < -self.preValue * 80 || self.arm.rotation > -self.preValue * 15){//控制大臂的抬起角度
          self.armFlag = true;
        }else{
          /*当每次角度移动量在单位量之间表示已经到位了*/
          if(Math.abs(self.armEndMove - self.arm.rotation) <= self.armMove){
            self.arm.rotation = self.armEndMove;
            self.armFlag = true;
          }else{
            if(self.arm.rotation > self.armEndMove){
              self.arm.rotation -= self.armMove * delta;
            }else{
              self.arm.rotation += self.armMove * delta;
            }
          }
        }
        /*计算顶部卷筒绳索的x,y方向的值计算需要的绳长以及角度*/
        const armEndHeight = self.armHeight/Math.cos(-self.arm.rotation);//动臂存在仰角时在臂上的垂直距离
        const rightTopAngle = 90-(180-(90 + self.arm.rotation/self.preValue)-self.armAngle);//求的右上角的斜边与水平夹角
        const armEndWidth = self.armRightSide * Math.cos(self.preValue * rightTopAngle);//动臂存在仰角时顶部绳结到臂尾的水平距离
        const armNoEndWidth = self.armWidth * Math.cos(-self.arm.rotation) - armEndWidth;//臂左边到顶部绳结的水平距离
        const dingLineWidth = armNoEndWidth + self.dingLineArmStart  + 1;
        const armUpHeight = Math.sin(-self.arm.rotation) * self.armWidth;//臂头抬起的垂直距离
        const armUpWidth = Math.cos(-self.arm.rotation) * self.armWidth;//臂头抬起的水平距离
        const dingLineHeight = self.dingToArmBottom - Math.tan(-self.arm.rotation) * armNoEndWidth - armEndHeight;
        self.dingLine.rotation = Math.atan(dingLineHeight/dingLineWidth);
        self.dingLine.width = Math.sqrt(dingLineWidth * dingLineWidth + dingLineHeight * dingLineHeight);
        //绳子的联动
        self.line.y = self.armLeftBottomY - armUpHeight;
        self.line.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - (self.armWidth - armUpWidth);
        //挂钩
        self.hook.y = self.armLeftBottomY - armUpHeight  + self.line.height;
        self.hook.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.hookLineOffsetX - (self.armWidth - armUpWidth);
        const dingHookToFool = self.pictureHeight - self.foolHeight - self.line.y;//大臂尾处的挂钩距离地面的距离
        /*处理绳子的变化*/
        if(Math.abs(self.lineEndMove - self.line.height) <= Math.abs(self.lineMove)  || self.lineFlag){
          self.line.height = self.lineEndMove;
          self.hook.y = self.line.y + self.lineEndMove;
          if(self.cargoValue > 0) {//存在货物超过地面
            if ((self.line.height + self.hook.height + self.cargo.height) >= dingHookToFool) {
              self.line.height = dingHookToFool - self.hook.height - self.cargo.height;
              self.hook.y = self.line.y + self.line.height;
              self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
              self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
            } else {
              self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
              self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
            }
          }else{//防止钩子超过地面
            self.cargo.position.set(-100,this.pictureHeight);//卸货
            if((self.line.height + self.hook.height) >= dingHookToFool){
              self.line.height = dingHookToFool - self.hook.height;
              self.hook.y = self.line.y + self.line.height;
            }
          }
          self.lineFlag = true;
        }else if(!self.lineFlag){
          self.line.height += self.lineMove * delta;
          self.hook.y += self.lineMove * delta;
          if(self.oldCargo > 0){//之前存在货物
            if(self.cargoValue > 0){//现在存在货物
              if (self.lineMove > 0) {//下降状态
                if ((self.line.height + self.hook.height + self.cargo.height) >= dingHookToFool) {
                  self.lineFlag = true;
                } else {
                  self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
                  self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
                }
              } else {//上升状态
                if ((dingHookToFool - self.line.height - self.hook.height) > self.cargo.height) {
                  self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
                  self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
                }
              }
            }else{//现在不存在货物
              if ((self.line.height + self.hook.height + self.cargo.height) >= dingHookToFool) {
                self.cargo.position.set(-100,this.pictureHeight);
                if (self.line.height + self.hook.height >= dingHookToFool) {
                  self.lineFlag = true;
                }
              } else {
                self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
                self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
              }
            }
          }else{//之前不存在货物
            if(self.cargoValue > 0){//现在存在货物
              if (self.lineMove < 0) {
                if ((dingHookToFool - self.line.height - self.hook.height) > self.cargo.height) {
                  self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
                  self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
                }
              } else {
                if ((dingHookToFool - self.line.height - self.hook.height) <= self.cargo.height) {
                  self.cargo.y = self.armLeftBottomY - armUpHeight + self.line.height + self.hook.height;
                  self.cargo.x = self.armLeftBottomX + self.armWidth - self.armHookWidth - self.cargoLineOffsetX - (self.armWidth - armUpWidth);
                  self.lineFlag = true;
                }
              }
            }else{//现在不存在货物
              if(self.line.height + self.hook.height >= dingHookToFool){
                self.lineFlag = true;
              }
            }
          }
        }
      }
    });
  }
  /*更新*/
  update({height,elevationAngle,loadValue}){
    /*将大臂的抬起角度控制在15~80之间*/
    if(elevationAngle >= 80){
      elevationAngle = 80;
    }else if(elevationAngle <= 15){
      elevationAngle = 15;
    }
    this.newAnimationData = {lineHeight:height * this.lineScale,rotation:elevationAngle,loadValue:loadValue};
    this.armMove = Math.abs((this.newAnimationData.rotation - this.oldAnimationData.rotation) * this.preValue) / 100;
    this.lineMove = (this.newAnimationData.lineHeight - this.oldAnimationData.lineHeight) / 100;
    /*最终到达的目标值*/
    this.armEndMove = -this.newAnimationData.rotation * this.preValue;
    this.lineEndMove = this.newAnimationData.lineHeight;
    /*重物的吊起情况*/
    this.oldCargo = this.oldAnimationData.loadValue;
    this.cargoValue = this.newAnimationData.loadValue;
    this.lineFlag = false;
    this.armFlag = false;
    this.sideView.ticker.start();
    this.oldAnimationData = this.newAnimationData;
  }
}
