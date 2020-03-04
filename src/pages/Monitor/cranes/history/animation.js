/*eslint-disable*/
import * as PIXI from 'pixi.js'
const preValue = Math.PI / 180; // 计算弧度制专用
export default class Animation{
  radius = 0;
  x = 0;
  y = 0;
  oldRadius = 0;
  rotation = 0;
  craneMove = 0;
  carMove = 0;
  armFlag = false;
  carFlag = false;
  app = null;
  craneType = null;
  richText = null;
  crane = new PIXI.Graphics();//圆+半径
  car = new PIXI.Graphics();//小车
  dash = new PIXI.Container();
  draggingX = 0;
  draggingY = 0;
  style = {
    fontFamily: 'Arial',
    fontSize: 7,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#39a3f4'], // gradient
    stroke: '#4a1850',
    strokeThickness: 4,
    dropShadow: true,//为文本设置阴影
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 2,
    wordWrap: true,
    wordWrapWidth: 440
  };
  /*画图*/
  draw({x, y, arm, balanceArm, radius, rotation,craneType, name,color, app}) {
    const newRotation = this.translateAngle(rotation);//笛卡尔转canvas坐标新角度
    this.crane.interactive = true; //开启交互
    this.crane.buttonMode = true;//设置指针
    this.crane.cursor = 'pointer';
    this.crane.name = name;
    this.dash.interactive = true;
    this.dash.buttonMode = true;//设置指针
    this.dash.cursor = 'pointer';
    this.dash.name = name;
    let width = 2;//塔机臂的宽度
    let circle = 3;//圆心的半径
    let circleLine = 1;//圆心的边宽
    let opcity = 0.4;
    //由于无法再圆绘制完成后更改圆的半径，所以需要在scale时取大概的值以使其不至于差别太大
    if(craneType === 1){
      if(radius >= arm * (3/4)){
        width = 2;
        circle = 3;
        circleLine = 1;
      }else{
        width = 1.3;
        circle = 2.2;
        circleLine = 0.5;
        opcity = 0.7
      }
    }
    this.crane.lineStyle(width, 0xb3b2b2, 1);
    this.crane.moveTo(-balanceArm, 0);
    this.crane.lineTo(craneType === 1 ? radius : arm, 0);
    this.crane.endFill();

    this.crane.lineStyle(circleLine, 0xb3b2b2, 1);
    this.crane.beginFill(0xDC143C);
    this.crane.drawCircle(0, 0, circle);
    this.crane.endFill();

    this.crane.lineStyle(circleLine, 0, 0);
    this.crane.beginFill(0xfcfdfe,0.03);
    this.crane.drawCircle(0, 0, craneType === 1 ? radius : arm);
    this.crane.endFill();
    const one = Math.PI * preValue;
    for(let i = 0; i < 360/Math.PI; i++){
      if(!(i%2)){
        const arc = new PIXI.Graphics();
        arc.lineStyle(circleLine, color, opcity);
        arc.arc(0, 0, craneType === 1 ? radius : arm, i * one, (i + 1) * one);
        this.dash.addChild(arc);
      }
    }
    this.crane.x = x;
    this.crane.y = y;
    this.dash.x = x;
    this.dash.y = y;
    this.crane.rotation = preValue * newRotation;
    //小车
    this.car.beginFill(0xDC143C);
    this.car.lineStyle(0);
    this.car.drawCircle(0, 0, 3);
    this.car.endFill();
    this.car.x = x + radius * Math.cos(preValue * newRotation);
    this.car.y = y + radius * Math.sin(preValue * newRotation);
    this.richText = new PIXI.Text(name, this.style);
    this.richText.x = x - 15;
    this.richText.y = y - 25;
    app.stage.addChild(this.richText,this.dash,this.crane,this.car);
    this.x = x;
    this.y = y;
    this.draggingX = x;
    this.draggingY = y;
    this.radius = radius;
    this.rotation = newRotation;
    this.oldRadius = radius;
    this.app = app;
    this.craneType = craneType;
  }
  /*动画*/
  animate(){
    const self = this;
    let d = 0;
    this.app.ticker.add(function (delta) {
      if(self.armFlag && self.carFlag){
        self.oldRadius = self.radius;
        d = 0;
        self.armFlag = false;
        self.carFlag = false;
        self.app.ticker.stop();
      }else{
        /*当来回摆动的幅度在增量的范围内时，就表示到位了*/
        const sub1 = Math.abs(self.crane.rotation - (preValue * self.rotation));
        const sub2 = Math.abs(self.oldRadius + d - self.radius);
        // 判断大臂是否到达新的位置，不是就继续移动
        if (sub1 < self.craneMove) {
          self.crane.rotation = preValue * self.rotation;
          self.armFlag = true;
        } else {
          /*处理塔机臂*/
          if (self.crane.rotation > preValue * self.rotation) {
            self.crane.rotation -= self.craneMove * delta;
          } else {
            self.crane.rotation += self.craneMove * delta;
          }
        }
        // 判断小车是否到达新的位置，不是就继续移动
        if (sub2 < self.carMove && self.armFlag) {
          self.car.x = self.draggingX + self.radius * Math.cos(preValue * self.rotation);
          self.car.y = self.draggingY + self.radius * Math.sin(preValue * self.rotation);
          self.carFlag = true;
        } else {
          /*处理小车*/
          if (self.oldRadius + d > self.radius) {
            d -= self.carMove * delta;
            if(self.craneType === 1){
              self.crane.scale.x *= (self.oldRadius + d)/(self.oldRadius + d + self.carMove * delta);
              self.crane.scale.y *= (self.oldRadius + d)/(self.oldRadius + d + self.carMove * delta);
              self.dash.scale.x *= (self.oldRadius + d)/(self.oldRadius + d + self.carMove * delta);
              self.dash.scale.y *= (self.oldRadius + d)/(self.oldRadius + d + self.carMove * delta);
            }
          } else {
            d += self.carMove * delta;
            if(self.craneType === 1){
              self.crane.scale.x *= (self.oldRadius + d)/(self.oldRadius + d - self.carMove * delta);
              self.crane.scale.y *= (self.oldRadius + d)/(self.oldRadius + d - self.carMove * delta);
              self.dash.scale.x *= (self.oldRadius + d)/(self.oldRadius + d - self.carMove * delta);
              self.dash.scale.y *= (self.oldRadius + d)/(self.oldRadius + d - self.carMove * delta);
            }
          }
          self.car.x = self.draggingX + (self.oldRadius + d) * Math.cos(self.crane.rotation);
          self.car.y = self.draggingY + (self.oldRadius + d) * Math.sin(self.crane.rotation);
        }
      }
    })
  }
  /*更新*/
  update({x, y, radius, rotation,speed}) {
    let runSpeed = 100;
    if(speed) runSpeed = speed;
    const newRotation = this.translateAngle(rotation);//笛卡尔转canvas坐标新角度
    const rotateAngle = this.transformMinAngle(newRotation);
    this.craneMove = (preValue * rotateAngle[0]) / runSpeed; // PIXI动画执行的是60次/s
    this.carMove = Math.abs((radius - this.radius) / runSpeed);// 只有旋转角度时，小车的每次增加值为0
    /*判断如果跨0度的处理*/
    if (rotateAngle[1]) {
      if (newRotation > 180) {
        this.crane.rotation = this.crane.rotation + preValue * 360;
      } else {
        this.crane.rotation = this.crane.rotation - preValue * 360;
      }
    }
    this.radius = radius;
    this.rotation = newRotation;
    this.armFlag = false;
    this.carFlag = false;
    this.app.ticker.start();
  }

  /*笛卡尔度数转为canvas度数*/
  translateAngle(angle) {
    const newAngle = angle%360;
    return newAngle < 0 ? -newAngle : 360-newAngle;
  }

  /*判断旋转最小角度*/
  transformMinAngle(newAngle) {
    const diff = Math.abs(this.rotation - newAngle);
    return [Math.abs(diff <= 180 ? diff : diff - 360), diff <= 180 ? 0 : 1];//0:未过0度，1：过0度
  }
}
