/*eslint-disable*/
import * as PIXI from 'pixi.js'
const preValue = Math.PI / 180; // 计算弧度制专用
const one = Math.PI * preValue;
export default class Animation{
  radius = 0;
  x = 0;
  y = 0;
  oldRadius = 0;
  rotation = 0;
  craneMove = 0;
  carMove = 0;
  balanceArm = 0;
  arm = 0;
  armFlag = false;
  carFlag = false;
  app = null;
  craneType = null;
  isOnline = null;
  animatedSprite = [];
  limitWarningOut = null;
  limitAlarmOut = null;
  antiWarningOut = null;
  antiAlarmOut = null;
  areaWarningOut = null;
  areaAlarmOut = null;

  limitWarningInto = null;
  limitAlarmInto = null;
  antiWarningInto = null;
  antiAlarmInto = null;
  areaWarningInto = null;
  areaAlarmInto = null;

  limitWarningLeft = null;
  limitAlarmLeft = null;
  antiWarningLeft = null;
  antiAlarmLeft = null;
  areaWarningLeft = null;
  areaAlarmLeft = null;

  limitWarningRight = null;
  limitAlarmRight = null;
  antiWarningRight = null;
  antiAlarmRight = null;
  areaWarningRight = null;
  areaAlarmRight = null;

  dropWarningUp = null;
  dropAlarmUp = null;
  dropWarningDown = null;
  dropAlarmDown = null;
  windSpeedWarning = null;
  windSpeedAlarm = null;
  torqueWarning = null;
  torqueAlarm = null;
  crane = new PIXI.Graphics();//圆+半径
  areaGra = new PIXI.Graphics(); //区域
  car = new PIXI.Graphics();//小车
  dash = new PIXI.Container();
  richText = new PIXI.Text();
  onlineStyle = {
    fontFamily: 'Arial',
    fontSize: 12,
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
  offlineStyle = {
    fontFamily: 'Arial',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#6c6d6d'], // gradient
    stroke: null,
    strokeThickness: 4,
    dropShadow: true,//为文本设置阴影
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 2,
    wordWrap: true,
    wordWrapWidth: 440
  };
  redColor = 0xDC143C;//红色
  whiteColor = 0xb3b2b2;//白色
  fillColor = 0xfcfdfe; //圆阴影区域颜色
  lineColor = 0x00ff99;//虚线边颜色
  offlineColor = 0x6c6d6d;//掉线颜色
  /*处理动臂和平臂*/
  resolveType(){
    let width = 2;//塔机臂的宽度
    let circle = 3;//圆心的半径
    let circleLine = 1;//圆心的边宽
    let opcity = 0.45;
    if(this.craneType === 1){
      if(this.radius >= this.arm * (3/4)){
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
    return {width:width,circle:circle,circleLine:circleLine,opcity:opcity};
  }
  /*画图*/
  draw({x,y,area,areaAttribute,arm,balanceArm,radius,rotation,craneType,app}) {
    this.crane.x = x;
    this.crane.y = y;
    this.dash.x = x;
    this.dash.y = y;
    this.crane.rotation = preValue * rotation;
    this.car.x = x + radius * Math.cos(preValue * rotation);
    this.car.y = y + radius * Math.sin(preValue * rotation);
    this.richText.x = x;
    this.richText.y = y - 25;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.oldRadius = radius;
    this.craneType = craneType;
    this.rotation = rotation;
    this.balanceArm = balanceArm;
    this.arm = arm;
    /*画区域*/
    area.forEach((item,index)=>{
      const preAreaAttribute = areaAttribute[index]; // 区域是外区域还是内区域
      const preArea = new PIXI.Graphics();
      preArea.lineStyle(0);
      preArea.beginFill(0xd2d901, 0.1);
      const firstItem = item[0];
      const lastItem = item[item.length - 1];
      preArea.moveTo(firstItem.x,firstItem.y);
      item.forEach((area,index)=>{
        if(index > 0 && index < item.length - 1){
          if(!preAreaAttribute){
            const result = this.resolvePoint(area);
            preArea.lineTo(result.x,result.y);
          }else{
            preArea.lineTo(area.x,area.y);
          }
        }
      });
      preArea.lineTo(lastItem.x,lastItem.y);
      if(!preAreaAttribute){
        const beginRad = this.calcRad(firstItem);
        const endRad = this.calcRad(lastItem);
        // 开始弧度+1求出相交点
        const plusY = Math.sin(beginRad + preValue) * arm;
        const plusX = Math.cos(beginRad + preValue) * arm;
        const plusCood = {x:x + plusX,y:y + plusY};
        let num = 0;
        for(let i = 0; i < item.length - 1; i++){
          if(this.calcLineCross(item[i],item[i + 1],{x,y},plusCood)){
            num++;
          }
        }
        if(num % 2){
          preArea.arc(x, y, arm , endRad, beginRad,true); // 逆时针
        }else{
          preArea.arc(x, y, arm , endRad, beginRad); // 顺时针
        }
      }
      preArea.closePath();
      preArea.endFill();
      this.areaGra.addChild(preArea);
    });
    this.app = app;
    this.app.stage.addChild(this.areaGra);
    if(this.craneType !== 1){
      this.initOutAlarm();
      this.initOthers();
    }
  }
  /*初始化出限位、出限制区、出防碰撞的报警*/
  initOutAlarm(){
    const imageArray = {
      limitWarningOut:null,
      limitAlarmOut:null,
      antiWarningOut:null,
      antiAlarmOut:null,
      areaWarningOut:null,
      areaAlarmOut:null,
      limitWarningInto:null,
      limitAlarmInto:null,
      antiWarningInto:null,
      antiAlarmInto:null,
      areaWarningInto:null,
      areaAlarmInto:null,
      limitWarningLeft:null,
      limitAlarmLeft:null,
      antiWarningLeft:null,
      antiAlarmLeft:null,
      areaWarningLeft:null,
      areaAlarmLeft:null,
      limitWarningRight:null,
      limitAlarmRight:null,
      antiWarningRight:null,
      antiAlarmRight:null,
      areaWarningRight:null,
      areaAlarmRight:null,
    };
    const keys = [];
    const resources = PIXI.Loader.shared.resources;
    for(const key in imageArray){
      //this[key] = new PIXI.AnimatedSprite([resources[key].texture,resources.bg.texture]);
      this[key] = new PIXI.Sprite(resources[key].texture);
      if(key.indexOf('Out') > -1){
        if(key.indexOf('limit') > -1){
          const x = Math.cos(this.crane.rotation) * (this.radius - 30) + this.x;
          const y = Math.sin(this.crane.rotation) * (this.radius - 30) + this.y;
          this[key].position.set(x,y);
        }
        if(key.indexOf('anti') > -1){
          const x = this.x + Math.sin(this.crane.rotation) * 10  + (this.radius - 30) * Math.cos(this.crane.rotation);
          const y = this.y + (Math.sin(this.crane.rotation) * (this.radius - 30) - Math.cos(this.crane.rotation) * 10);
          this[key].position.set(x,y);
        }
        if(key.indexOf('area') > -1){
          const x = this.x + (this.radius - 56) * Math.cos(this.crane.rotation);
          const y = this.y + (this.radius - 56) * Math.sin(this.crane.rotation);
          this[key].position.set(x,y);
        }
      }
      if(key.indexOf('Into') > -1){
        if(key.indexOf('limit') > -1){
          const x = this.x + (this.radius - 26) * Math.cos(this.crane.rotation);
          const y = this.y + (this.radius - 26) * Math.sin(this.crane.rotation);
          this[key].position.set(x,y);
        }
        if(key.indexOf('anti') > -1){
          const x = this.x + Math.sin(this.crane.rotation) * 10  + (this.radius + 4) * Math.cos(this.crane.rotation);
          const y = this.y + (Math.sin(this.crane.rotation) * (this.radius + 4) - Math.cos(this.crane.rotation) * 10);
          this[key].position.set(x,y);
        }
        if(key.indexOf('area') > -1){
          const x = Math.cos(this.crane.rotation) * (this.radius + 4) + this.x;
          const y = Math.sin(this.crane.rotation) * (this.radius + 4) + this.y;
          this[key].position.set(x,y);
        }
      }
      if(key.indexOf('Left') > -1){
        if(key.indexOf('limit') > -1){
          const x = this.x + Math.sin(this.crane.rotation) * 36 + (this.radius - 5) * Math.cos(this.crane.rotation);
          const y = this.y + (this.radius - 5) * Math.sin(this.crane.rotation) - Math.cos(this.crane.rotation) * 36;
          this[key].position.set(x,y);
        }
        if(key.indexOf('anti') > -1){
          const x = this.x + Math.sin(this.crane.rotation) * 36 + (this.radius + 6) * Math.cos(this.crane.rotation);
          const y = this.y + (this.radius + 6) * Math.sin(this.crane.rotation) - Math.cos(this.crane.rotation) * 36;
          this[key].position.set(x,y);
        }
        if(key.indexOf('area') > -1){
          const x = this.x + Math.sin(this.crane.rotation) * 36 + (this.radius - 16) * Math.cos(this.crane.rotation);
          const y = this.y + (this.radius - 16) * Math.sin(this.crane.rotation) - Math.cos(this.crane.rotation) * 36;
          this[key].position.set(x,y);
        }
      }
      if(key.indexOf('Right') > -1){
        if(key.indexOf('limit') > -1){
          const x = this.x + (this.radius - 5) * Math.cos(this.crane.rotation) - Math.sin(this.crane.rotation) * 10;
          const y = this.y + (this.radius - 5) * Math.sin(this.crane.rotation) + Math.cos(this.crane.rotation) * 10;
          this[key].position.set(x,y);
        }
        if(key.indexOf('anti') > -1){
          const x = this.x + (this.radius + 6) * Math.cos(this.crane.rotation) - Math.sin(this.crane.rotation) * 10;
          const y = this.y + (this.radius + 6) * Math.sin(this.crane.rotation) + Math.cos(this.crane.rotation) * 10;
          this[key].position.set(x,y);
        }
        if(key.indexOf('area') > -1){
          const x = this.x + (this.radius - 16) * Math.cos(this.crane.rotation) - Math.sin(this.crane.rotation) * 10;
          const y = this.y + (this.radius - 16) * Math.sin(this.crane.rotation) + Math.cos(this.crane.rotation) * 10;
          this[key].position.set(x,y);
        }
      }
      this[key].rotation = this.crane.rotation;
      this[key].scale.set(0.4);
      //this[key].animationSpeed = 0.03;
      //this[key].stop();
      this[key].alpha = 0;
      keys.push(this[key]);
    }
    this.app.stage.addChild(...keys);
  }
  /*初始化进限位、进限制区、进防碰撞的报警*/
  initIntoAlarm(){
    const imageArray = {
      limitWarningInto:limitWarningInto,
      limitAlarmInto:limitAlarmInto,
      antiWarningInto:antiWarningInto,
      antiAlarmInto:antiAlarmInto,
      areaWarningInto:areaWarningInto,
      areaAlarmInto:areaAlarmInto
    };
    for(const key in imageArray){
      let textureArray = [];
      let alienImages = [imageArray[key],bg];
      for (let i=0; i < 2; i++)
      {
        let texture = PIXI.Texture.from(alienImages[i]);
        textureArray.push(texture);
      };
      this[key] = new PIXI.AnimatedSprite(textureArray);
      if(key.indexOf('limit') > -1){
        const x = this.x + (this.radius - 26) * Math.cos(this.crane.rotation);
        const y = this.y + (this.radius - 26) * Math.sin(this.crane.rotation);

        this[key].position.set(x,y);
      }
      if(key.indexOf('anti') > -1){
        const x = this.x + Math.sin(this.crane.rotation) * 10  + (this.radius + 4) * Math.cos(this.crane.rotation);
        const y = this.y + (Math.sin(this.crane.rotation) * (this.radius + 4) - Math.cos(this.crane.rotation) * 10);
        this[key].position.set(x,y);
      }
      if(key.indexOf('area') > -1){
        const x = Math.cos(this.crane.rotation) * (this.radius + 4) + this.x;
        const y = Math.sin(this.crane.rotation) * (this.radius + 4) + this.y;
        this[key].position.set(x,y);
      }
      this[key].rotation = this.crane.rotation;
      this[key].scale.set(0.4);
      // this[key].animationSpeed = 0.03;
      // this[key].stop();
      this[key].alpha = 0;
      this.app.stage.addChild(this[key]);
    }
  }
  /*初始化左转限位、左转限制区、左转防碰撞的报警*/
  initLeftAlarm(){
    const imageArray = {
      limitWarningLeft:limitWarningLeft,
      limitAlarmLeft:limitAlarmLeft,
      antiWarningLeft:antiWarningLeft,
      antiAlarmLeft:antiAlarmLeft,
      areaWarningLeft:areaWarningLeft,
      areaAlarmLeft:areaAlarmLeft
    };
    for(const key in imageArray){
      let textureArray = [];
      let alienImages = [imageArray[key],bg];
      for (let i=0; i < 2; i++)
      {
        let texture = PIXI.Texture.from(alienImages[i]);
        textureArray.push(texture);
      };
      this[key] = new PIXI.AnimatedSprite(textureArray);
      if(key.indexOf('limit') > -1){
        const x = this.x + Math.sin(this.crane.rotation) * 36 + (this.radius - 5) * Math.cos(this.crane.rotation);
        const y = this.y + (this.radius - 5) * Math.sin(this.crane.rotation) - Math.cos(this.crane.rotation) * 36;
        this[key].position.set(x,y);
      }
      if(key.indexOf('anti') > -1){
        const x = this.x + Math.sin(this.crane.rotation) * 36 + (this.radius + 6) * Math.cos(this.crane.rotation);
        const y = this.y + (this.radius + 6) * Math.sin(this.crane.rotation) - Math.cos(this.crane.rotation) * 36;
        this[key].position.set(x,y);
      }
      if(key.indexOf('area') > -1){
        const x = this.x + Math.sin(this.crane.rotation) * 36 + (this.radius - 16) * Math.cos(this.crane.rotation);
        const y = this.y + (this.radius - 16) * Math.sin(this.crane.rotation) - Math.cos(this.crane.rotation) * 36;
        this[key].position.set(x,y);
      }
      this[key].rotation = this.crane.rotation;
      this[key].scale.set(0.4);
      // this[key].animationSpeed = 0.03;
      // this[key].stop();
      this[key].alpha = 1;
      this.app.stage.addChild(this[key]);
    }
  }
  /*初始化右转限位、右转限制区、右转防碰撞的报警*/
  initRightAlarm(){
    const imageArray = {
      limitWarningRight:limitWarningRight,
      limitAlarmRight:limitAlarmRight,
      antiWarningRight:antiWarningRight,
      antiAlarmRight:antiAlarmRight,
      areaWarningRight:areaWarningRight,
      areaAlarmRight:areaAlarmRight
    };
    for(const key in imageArray){
      let textureArray = [];
      let alienImages = [imageArray[key],bg];
      for (let i=0; i < 2; i++)
      {
        let texture = PIXI.Texture.from(alienImages[i]);
        textureArray.push(texture);
      };
      this[key] = new PIXI.AnimatedSprite(textureArray);
      if(key.indexOf('limit') > -1){
        const x = this.x + (this.radius - 5) * Math.cos(this.crane.rotation) - Math.sin(this.crane.rotation) * 10;
        const y = this.y + (this.radius - 5) * Math.sin(this.crane.rotation) + Math.cos(this.crane.rotation) * 10;
        this[key].position.set(x,y);
      }
      if(key.indexOf('anti') > -1){
        const x = this.x + (this.radius + 6) * Math.cos(this.crane.rotation) - Math.sin(this.crane.rotation) * 10;
        const y = this.y + (this.radius + 6) * Math.sin(this.crane.rotation) + Math.cos(this.crane.rotation) * 10;
        this[key].position.set(x,y);
      }
      if(key.indexOf('area') > -1){
        const x = this.x + (this.radius - 16) * Math.cos(this.crane.rotation) - Math.sin(this.crane.rotation) * 10;
        const y = this.y + (this.radius - 16) * Math.sin(this.crane.rotation) + Math.cos(this.crane.rotation) * 10;
        this[key].position.set(x,y);
      }
      this[key].rotation = this.crane.rotation;
      // this[key].scale.set(0.4);
      // this[key].animationSpeed = 0.03;
      this[key].stop();
      this[key].alpha = 1;
      this.app.stage.addChild(this[key]);
    }
  }
  /*风速、高度上下限、力矩*/
  initOthers(){
    const imageArray = {
      dropWarningUp:null,
      dropAlarmUp:null,
      dropWarningDown:null,
      dropAlarmDown:null,
      windSpeedWarning:null,
      windSpeedAlarm:null,
      torqueWarning:null,
      torqueAlarm:null
    };
    const resources = PIXI.Loader.shared.resources;
    for(const key in imageArray){
      //this[key] = new PIXI.AnimatedSprite([resources[key].texture,resources.bg.texture]);
      this[key] = new PIXI.Sprite(resources[key].texture);
      if(key.indexOf('Up') > -1){
        this[key].position.set(this.x - 36,this.y + 3);
      }
      if(key.indexOf('Down') > -1){
        this[key].position.set(this.x - 19,this.y + 3);
      }
      if(key.indexOf('wind') > -1){
        this[key].position.set(this.x,this.y + 3);
      }
      if(key.indexOf('torque') > -1){
        this[key].position.set(this.x + 17,this.y + 3);
      }
      this[key].scale.set(0.13);
      //this[key].animationSpeed = 0.03;
      //this[key].stop();
      this[key].alpha = 0;
      this.app.stage.addChild(this[key]);
    }
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
          self.refreshRotation(self);
          self.armFlag = true;
        } else {
          /*处理塔机臂*/
          if (self.crane.rotation > preValue * self.rotation) {
            self.crane.rotation -= self.craneMove * delta;
            self.refreshRotation(self);
          } else {
            self.crane.rotation += self.craneMove * delta;
            self.refreshRotation(self);
          }
        }
        // 判断小车是否到达新的位置，不是就继续移动
        if (sub2 < self.carMove && self.armFlag) {
          self.car.x = self.x + self.radius * Math.cos(preValue * self.rotation);
          self.car.y = self.y + self.radius * Math.sin(preValue * self.rotation);
          self.refreshPosition(self,self.radius,0);
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
          self.car.x = self.x + (self.oldRadius + d) * Math.cos(self.crane.rotation);
          self.car.y = self.y + (self.oldRadius + d) * Math.sin(self.crane.rotation);
          self.refreshPosition(self,self.oldRadius,d);
        }
      }
    })
  }
  /*更新角度*/
  refreshRotation(self){
    if(this.craneType === 1) return;
    self.limitWarningOut.rotation = self.crane.rotation;
    self.limitAlarmOut.rotation = self.crane.rotation;
    self.antiWarningOut.rotation = self.crane.rotation;
    self.antiAlarmOut.rotation = self.crane.rotation;
    self.areaWarningOut.rotation = self.crane.rotation;
    self.areaAlarmOut.rotation = self.crane.rotation;

    self.limitWarningInto.rotation = self.crane.rotation;
    self.limitAlarmInto.rotation = self.crane.rotation;
    self.antiWarningInto.rotation = self.crane.rotation;
    self.antiAlarmInto.rotation = self.crane.rotation;
    self.areaWarningInto.rotation = self.crane.rotation;
    self.areaAlarmInto.rotation = self.crane.rotation;

    self.limitWarningLeft.rotation = self.crane.rotation;
    self.limitAlarmLeft.rotation = self.crane.rotation;
    self.antiWarningLeft.rotation = self.crane.rotation;
    self.antiAlarmLeft.rotation = self.crane.rotation;
    self.areaWarningLeft.rotation = self.crane.rotation;
    self.areaAlarmLeft.rotation = self.crane.rotation;

    self.limitWarningRight.rotation = self.crane.rotation;
    self.limitAlarmRight.rotation = self.crane.rotation;
    self.antiWarningRight.rotation = self.crane.rotation;
    self.antiAlarmRight.rotation = self.crane.rotation;
    self.areaWarningRight.rotation = self.crane.rotation;
    self.areaAlarmRight.rotation = self.crane.rotation;
  }
  /*更新位置*/
  refreshPosition(self,oldRadius,d){
    if(self.craneType === 1) return;
    const x1 = Math.cos(self.crane.rotation) * (oldRadius - 30 + d) + self.x;
    const y1 = Math.sin(self.crane.rotation) * (oldRadius - 30 + d) + self.y;
    self.limitWarningOut.position.set(x1,y1);
    self.limitAlarmOut.position.set(x1,y1);
    const x2 = self.x + Math.sin(self.crane.rotation) * 10  + (oldRadius - 30 + d) * Math.cos(self.crane.rotation);
    const y2 = self.y + (Math.sin(self.crane.rotation) * (oldRadius - 30 + d) - Math.cos(self.crane.rotation) * 10);
    self.antiWarningOut.position.set(x2,y2);
    self.antiAlarmOut.position.set(x2,y2);
    const x3 = self.x + (oldRadius - 56 + d) * Math.cos(self.crane.rotation);
    const y3 = self.y + (oldRadius - 56 + d) * Math.sin(self.crane.rotation);
    self.areaWarningOut.position.set(x3,y3);
    self.areaAlarmOut.position.set(x3,y3);

    const x4 = self.x + (oldRadius - 26 + d) * Math.cos(self.crane.rotation);
    const y4 = self.y + (oldRadius - 26 + d) * Math.sin(self.crane.rotation);
    self.limitWarningInto.position.set(x4,y4);
    self.limitAlarmInto.position.set(x4,y4);
    const x5 = self.x + Math.sin(self.crane.rotation) * 10  + (oldRadius + 4 + d) * Math.cos(self.crane.rotation);
    const y5 = self.y + (Math.sin(self.crane.rotation) * (oldRadius + 4 + d) - Math.cos(self.crane.rotation) * 10);
    self.antiWarningInto.position.set(x5,y5);
    self.antiAlarmInto.position.set(x5,y5);
    const x6 = Math.cos(self.crane.rotation) * (oldRadius + 4 + d) + self.x;
    const y6 = Math.sin(self.crane.rotation) * (oldRadius + 4 + d) + self.y;
    self.areaWarningInto.position.set(x6,y6);
    self.areaAlarmInto.position.set(x6,y6);

    const x7 = self.x + Math.sin(self.crane.rotation) * 36 + (oldRadius - 5 + d) * Math.cos(self.crane.rotation);
    const y7 = self.y + (oldRadius - 5 + d) * Math.sin(self.crane.rotation) - Math.cos(self.crane.rotation) * 36;
    self.limitWarningLeft.position.set(x7,y7);
    self.limitAlarmLeft.position.set(x7,y7);
    const x8 = self.x + Math.sin(self.crane.rotation) * 36 + (oldRadius + 6 + d) * Math.cos(self.crane.rotation);
    const y8 = self.y + (oldRadius + 6 + d) * Math.sin(self.crane.rotation) - Math.cos(self.crane.rotation) * 36;
    self.antiWarningLeft.position.set(x8,y8);
    self.antiAlarmLeft.position.set(x8,y8);
    const x9 = self.x + Math.sin(self.crane.rotation) * 36 + (oldRadius - 16 + d) * Math.cos(self.crane.rotation);
    const y9 = self.y + (oldRadius - 16 + d) * Math.sin(self.crane.rotation) - Math.cos(self.crane.rotation) * 36;
    self.areaWarningLeft.position.set(x9,y9);
    self.areaAlarmLeft.position.set(x9,y9);

    const x10 = self.x + (oldRadius - 5 + d) * Math.cos(self.crane.rotation) - Math.sin(self.crane.rotation) * 10;
    const y10 = self.y + (oldRadius - 5 + d) * Math.sin(self.crane.rotation) + Math.cos(self.crane.rotation) * 10;
    self.limitWarningRight.position.set(x10,y10);
    self.limitAlarmRight.position.set(x10,y10);
    const x11 = self.x + (oldRadius + 6 + d) * Math.cos(self.crane.rotation) - Math.sin(self.crane.rotation) * 10;
    const y11 = self.y + (oldRadius + 6 + d) * Math.sin(self.crane.rotation) + Math.cos(self.crane.rotation) * 10;
    self.antiWarningRight.position.set(x11,y11);
    self.antiAlarmRight.position.set(x11,y11);
    const x12 = self.x + (oldRadius - 16 + d) * Math.cos(self.crane.rotation) - Math.sin(self.crane.rotation) * 10;
    const y12 = self.y + (oldRadius - 16 + d) * Math.sin(self.crane.rotation) + Math.cos(self.crane.rotation) * 10;
    self.areaWarningRight.position.set(x12,y12);
    self.areaAlarmRight.position.set(x12,y12);
  }
  /*更新*/
  update({radius, rotation,alarmResult,speed,isOnline,name}) {
    this.resolveOnline(isOnline,name);
    switch(speed){
      case 2:
        this.app.ticker.speed = 2;
        break;
      case 3:
        this.app.ticker.speed = 3;
        break;
      default:
        this.app.ticker.speed = 1;
        break;
    }
    const rotateAngle = this.transformMinAngle(rotation);
    this.craneMove = (preValue * rotateAngle[0]) / 100; // PIXI动画执行的是60次/s
    this.carMove = Math.abs((radius - this.radius) / 100);// 只有旋转角度时，小车的每次增加值为0
    /*判断如果跨0度的处理*/
    if (rotateAngle[1]) {
      if (rotation > 180) {
        this.crane.rotation = this.crane.rotation + preValue * 360;
      } else {
        this.crane.rotation = this.crane.rotation - preValue * 360;
      }
    }
    this.radius = radius;
    this.rotation = rotation;
    this.armFlag = false;
    this.carFlag = false;
    if(this.craneType !== 1) this.resolveDisplay(alarmResult,isOnline);
    this.app.ticker.start();
  }
  /*处理在线和掉线的颜色显示问题*/
  resolveOnline(isOnline,name){
    if(this.isOnline === isOnline) return;
    this.isOnline = isOnline;
    const {width,circle,circleLine,opcity} = this.resolveType();
    const armColor = isOnline ? this.whiteColor : this.offlineColor;
    const heartLineColor = isOnline ? this.whiteColor : this.offlineColor;
    const heartFillColor = isOnline ? this.redColor : this.offlineColor;
    const sideColor = isOnline ? this.lineColor : this.offlineColor;
    const carFillColor = isOnline ? this.redColor : this.offlineColor;
    const textColor = isOnline ? this.onlineStyle : this.offlineStyle;
    /*处理文字*/
    this.app.stage.removeChild(this.richText);
    const textX = this.richText.x;
    const textY = this.richText.y;
    this.richText = new PIXI.Text(name,textColor);
    this.richText.x = textX;
    this.richText.y = textY;
    /*处理大臂和圆心*/
    this.app.stage.removeChild(this.crane);
    const craneX = this.crane.x,craneY = this.crane.y,craneRotation = this.crane.rotation;
    this.crane = new PIXI.Graphics();
    this.areaGra = new PIXI.Graphics();
    this.crane.interactive = true;
    this.crane.buttonMode = true;
    this.crane.cursor = 'pointer';
    this.crane.name = name;
    this.crane.lineStyle(width, armColor, 1);
    this.crane.moveTo(-this.balanceArm, 0);
    this.crane.lineTo(this.craneType === 1 ? this.radius : this.arm, 0);
    this.crane.endFill();

    this.crane.lineStyle(circleLine, heartLineColor, 1);
    this.crane.beginFill(heartFillColor);
    this.crane.drawCircle(0, 0, circle);
    this.crane.endFill();
    this.crane.lineStyle(circleLine, 0, 0);
    this.crane.beginFill(this.fillColor,0.001);
    this.crane.drawCircle(0, 0, this.craneType === 1 ? this.radius : this.arm);
    this.crane.endFill();
    this.crane.x = craneX;
    this.crane.y = craneY;
    this.crane.rotation = craneRotation;
    /*处理小车*/
    this.app.stage.removeChild(this.car);
    const carX = this.car.x;
    const cary = this.car.y;
    this.car = new PIXI.Graphics();
    this.car.beginFill(carFillColor);
    this.car.lineStyle(0);
    this.car.drawCircle(0, 0, 3);
    this.car.endFill();
    this.car.x = carX;
    this.car.y = cary;

    /*画外围虚线*/
    this.app.stage.removeChild(this.dash);
    const dashX = this.dash.x;
    const dashY = this.dash.y;
    this.dash = new PIXI.Container();
    for(let i = 0; i < 360/Math.PI; i++){
      if(!(i%2)){
        const arc = new PIXI.Graphics();
        arc.lineStyle(circleLine, sideColor, opcity);
        arc.arc(0, 0, this.craneType === 1 ? this.radius : this.arm, i * one, (i + 1) * one);
        this.dash.addChild(arc);
      }
    }
    this.dash.x = dashX;
    this.dash.y = dashY;
    this.app.stage.addChild(this.richText,this.dash,this.crane,this.car);
  }
  /*处理报警显示与否*/
  resolveDisplay(alarmResult,isOnline){
    let warning = [],alarm = [];
    if(isOnline){
      warning = alarmResult.warning;
      alarm = alarmResult.alarm;
    };
    for(let i = 0; i < 17; i++){
      switch(i){
        case 0:
          //this.antiAlarmLeft.stop();
          this.antiAlarmLeft.alpha = 0;
          //this.antiWarningLeft.stop();
          this.antiWarningLeft.alpha = 0;
          if(alarm.includes(0)){
            //this.antiAlarmLeft.play();
            //this.antiAlarmLeft.animationSpeed = 0.07;
            this.antiAlarmLeft.alpha = 1;
          }else{
            if(warning.includes(0)){
              //this.antiWarningLeft.play();
              //this.antiWarningLeft.animationSpeed = 0.03;
              this.antiWarningLeft.alpha = 1;
            }
          }
          break;
        case 1:
          //this.antiAlarmRight.stop();
          this.antiAlarmRight.alpha = 0;
          //this.antiWarningRight.stop();
          this.antiWarningRight.alpha = 0;
          if(alarm.includes(1)){
            //this.antiAlarmRight.play();
            //this.antiAlarmRight.animationSpeed = 0.07;
            this.antiAlarmRight.alpha = 1;
          }else{
            if(warning.includes(1)){
              //this.antiWarningRight.play();
              //this.antiWarningRight.animationSpeed = 0.03;
              this.antiWarningRight.alpha = 1;
            }
          }
          break;
        case 2:
          //this.antiAlarmOut.stop();
          this.antiAlarmOut.alpha = 0;
          //this.antiWarningOut.stop();
          this.antiWarningOut.alpha = 0;
          if(alarm.includes(2)){
            //this.antiAlarmOut.play();
            //this.antiAlarmOut.animationSpeed = 0.07;
            this.antiAlarmOut.alpha = 1;
          }else{
            if(warning.includes(2)){
              //this.antiWarningOut.play();
              //this.antiWarningOut.animationSpeed = 0.03;
              this.antiWarningOut.alpha = 1;
            }
          }
          break;
        case 3:
          //this.antiAlarmInto.stop();
          this.antiAlarmInto.alpha = 0;
          //this.antiWarningInto.stop();
          this.antiWarningInto.alpha = 0;
          if(alarm.includes(3)){
            //this.antiAlarmInto.play();
            //this.antiAlarmInto.animationSpeed = 0.07;
            this.antiAlarmInto.alpha = 1;
          }else{
            if(warning.includes(3)){
              //this.antiWarningInto.play();
              //this.antiWarningInto.animationSpeed = 0.03;
              this.antiWarningInto.alpha = 1;
            }
          }
          break;
        case 4:
          //this.areaAlarmLeft.stop();
          this.areaAlarmLeft.alpha = 0;
         // this.areaWarningLeft.stop();
          this.areaWarningLeft.alpha = 0;
          if(alarm.includes(4)){
            //this.areaAlarmLeft.play();
            //this.areaAlarmLeft.animationSpeed = 0.07;
            this.areaAlarmLeft.alpha = 1;
          }else{
            if(warning.includes(4)){
              //this.areaWarningLeft.play();
              //this.areaWarningLeft.animationSpeed = 0.03;
              this.areaWarningLeft.alpha = 1;
            }
          }
          break;
        case 5:
          //this.areaAlarmRight.stop();
          this.areaAlarmRight.alpha = 0;
          //this.areaWarningRight.stop();
          this.areaWarningRight.alpha = 0;
          if(alarm.includes(5)){
            //this.areaAlarmRight.play();
            //this.areaAlarmRight.animationSpeed = 0.07;
            this.areaAlarmRight.alpha = 1;
          }else{
            if(warning.includes(5)){
              //this.areaWarningRight.play();
              //this.areaWarningRight.animationSpeed = 0.03;
              this.areaWarningRight.alpha = 1;
            }
          }
          break;
        case 6:
          //this.areaAlarmOut.stop();
          this.areaAlarmOut.alpha = 0;
          //this.areaWarningOut.stop();
          this.areaWarningOut.alpha = 0;
          if(alarm.includes(6)){
            //this.areaAlarmOut.play();
            //this.areaAlarmOut.animationSpeed = 0.07;
            this.areaAlarmOut.alpha = 1;
          }else{
            if(warning.includes(6)){
              //this.areaWarningOut.play();
              //this.areaWarningOut.animationSpeed = 0.03;
              this.areaWarningOut.alpha = 1;
            }
          }
          break;
        case 7:
          //this.areaAlarmInto.stop();
          this.areaAlarmInto.alpha = 0;
         // this.areaWarningInto.stop();
          this.areaWarningInto.alpha = 0;
          if(alarm.includes(7)){
            //this.areaAlarmInto.play();
            //this.areaAlarmInto.animationSpeed = 0.07;
            this.areaAlarmInto.alpha = 1;
          }else{
            if(warning.includes(7)){
              //this.areaWarningInto.play();
              //this.areaWarningInto.animationSpeed = 0.03;
              this.areaWarningInto.alpha = 1;
            }
          }
          break;
        case 8:
          //this.limitAlarmLeft.stop();
          this.limitAlarmLeft.alpha = 0;
          //this.limitWarningLeft.stop();
          this.limitWarningLeft.alpha = 0;
          if(alarm.includes(8)){
            //this.limitAlarmLeft.play();
            //this.limitAlarmLeft.animationSpeed = 0.07;
            this.limitAlarmLeft.alpha = 1;
          }else{
            if(warning.includes(8)){
              //this.limitWarningLeft.play();
              //this.limitWarningLeft.animationSpeed = 0.03;
              this.limitWarningLeft.alpha = 1;
            }
          }
          break;
        case 9:
          //this.limitAlarmRight.stop();
          this.limitAlarmRight.alpha = 0;
          //this.limitWarningRight.stop();
          this.limitWarningRight.alpha = 0;
          if(alarm.includes(9)){
            //this.limitAlarmRight.play();
            //this.limitAlarmRight.animationSpeed = 0.07;
            this.limitAlarmRight.alpha = 1;
          }else{
            if(warning.includes(9)){
              //this.limitWarningRight.play();
              //this.limitWarningRight.animationSpeed = 0.03;
              this.limitWarningRight.alpha = 1;
            }
          }
          break;
        case 10:
          //this.limitAlarmOut.stop();
          this.limitAlarmOut.alpha = 0;
          //this.limitWarningOut.stop();
          this.limitWarningOut.alpha = 0;
          if(alarm.includes(10)){
            //this.limitAlarmOut.play();
            //this.limitAlarmOut.animationSpeed = 0.07;
            this.limitAlarmOut.alpha = 1;
          }else{
            if(warning.includes(10)){
             // this.limitWarningOut.play();
              //this.limitWarningOut.animationSpeed = 0.03;
              this.limitWarningOut.alpha = 1;
            }
          }
          break;
        case 11:
          //this.limitAlarmInto.stop();
          this.limitAlarmInto.alpha = 0;
          //this.limitWarningInto.stop();
          this.limitWarningInto.alpha = 0;
          if(alarm.includes(11)){
            //this.limitAlarmInto.play();
            //this.limitAlarmInto.animationSpeed = 0.07;
            this.limitAlarmInto.alpha = 1;
          }else{
            if(warning.includes(11)){
              //this.limitWarningInto.play();
             // this.limitWarningInto.animationSpeed = 0.03;
              this.limitWarningInto.alpha = 1;
            }
          }
          break;
        case 12:
          //this.dropWarningUp.stop();
          this.dropWarningUp.alpha = 0;
         // this.dropAlarmUp.stop();
          this.dropAlarmUp.alpha = 0;
          if(alarm.includes(12)){
           // this.dropAlarmUp.play();
           // this.dropAlarmUp.animationSpeed = 0.07;
            this.dropAlarmUp.alpha = 1;
          }else{
            if(warning.includes(12)){
             // this.dropWarningUp.play();
             // this.dropWarningUp.animationSpeed = 0.03;
              this.dropWarningUp.alpha = 1;
            }
          }
          break;
        case 13:
          //this.dropWarningDown.stop();
          this.dropWarningDown.alpha = 0;
         // this.dropAlarmDown.stop();
          this.dropAlarmDown.alpha = 0;
          if(alarm.includes(13)){
           // this.dropAlarmDown.play();
           // this.dropAlarmDown.animationSpeed = 0.07;
            this.dropAlarmDown.alpha = 1;
          }else{
            if(warning.includes(13)){
             // this.dropWarningDown.play();
             // this.dropWarningDown.animationSpeed = 0.03;
              this.dropWarningDown.alpha = 1;
            }
          }
          break;
        case 14:
        case 15:
          //this.torqueWarning.stop();
          this.torqueWarning.alpha = 0;
          //this.torqueAlarm.stop();
          this.torqueAlarm.alpha = 0;
          if(alarm.includes(14) || alarm.includes(15)){
            //this.torqueAlarm.play();
            //this.torqueAlarm.animationSpeed = 0.07;
            this.torqueAlarm.alpha = 1;
          }else{
            if(warning.includes(14) || warning.includes(15)){
              //this.torqueWarning.play();
             // this.torqueWarning.animationSpeed = 0.03;
              this.torqueWarning.alpha = 1;
            }
          }
          break;
        case 16:
          //this.windSpeedWarning.stop();
          this.windSpeedWarning.alpha = 0;
          //this.windSpeedAlarm.stop();
          this.windSpeedAlarm.alpha = 0;
          if(alarm.includes(16)){
            //this.windSpeedAlarm.play();
            //this.windSpeedAlarm.animationSpeed = 0.07;
            this.windSpeedAlarm.alpha = 1;
          }else{
            if(warning.includes(16)){
              //this.windSpeedWarning.play();
              //this.windSpeedWarning.animationSpeed = 0.03;
              this.windSpeedWarning.alpha = 1;
            }
          }
          break;
      }
    }
  }

  /*判断旋转最小角度*/
  transformMinAngle(newAngle) {
    const diff = Math.abs(this.rotation - newAngle);
    return [Math.abs(diff <= 180 ? diff : diff - 360), diff <= 180 ? 0 : 1];//0:未过0度，1：过0度
  }

  /*计算弧度*/
  calcRad(coordinate){
    const {x,y} = coordinate;
    const heightY =  Math.abs(y - this.y);
    const widthX =  Math.abs(x - this.x);
    let tan =  0;
    // 位于右半圆
    if (x >= this.x){
      if(y > this.y){ // 位于右半圆下半圆
        tan = Math.atan(heightY/widthX);
      }else if(y === this.y){ // 位于0度位置

      }else{ // 位于右半圆上半圆
        tan = preValue * 360 - Math.atan(heightY/widthX);
      }
    }
    else{ // 位于左半圆
      if(y > this.y){ // 位于左半圆下半圆
        tan = preValue * 180 - Math.atan(heightY/widthX);
      }else if(y === this.y){
        tan = preValue * 180;
      }else{ // 位于左半圆上半圆
        tan = Math.atan(heightY/widthX) + preValue * 180;
      }
    }
    return tan;
  }
  /*计算是否相交*/
  calcLineCross(a,b,c,d){
    // 这里利用了向量的知识
    const ab = {x:b.x - a.x,y:b.y-a.y};
    const ac = {x:c.x - a.x,y:c.y - a.y};
    const ad = {x:d.x - a.x,y:d.y - a.y};
    const abxac = (ab.x * ac.y) - (ab.y * ac.x);
    const abxad = (ab.x * ad.y) - (ab.y * ad.x);
    const cd = {x:d.x - c.x,y:d.y - c.y};
    const ca = {x:a.x - c.x,y:a.y - c.y};
    const cb = {x:b.x - c.x,y:b.y - c.y};
    const cdxca = (cd.x * ca.y) - (cd.y * ca.x);
    const cdxcb = (cd.x * cb.y) - (cd.y * cb.x);
    if(abxac * abxad < 0 && cdxca * cdxcb < 0){ // 证明c、d在ab的两侧
      const denominator = (b.y - a.y)*(d.x - c.x) - (a.x - b.x)*(c.y - d.y);
      // 线段所在直线的交点坐标 (x , y)
      const x = ( (b.x - a.x) * (d.x - c.x) * (c.y - a.y)
        + (b.y - a.y) * (d.x - c.x) * a.x
        - (d.y - c.y) * (b.x - a.x) * c.x ) / denominator ;
      const y = -( (b.y - a.y) * (d.y - c.y) * (c.x - a.x)
        + (b.x - a.x) * (d.y - c.y) * a.y
        - (d.x - c.x) * (b.y - a.y) * c.y ) / denominator;
      return true;
    }
    return false;
  }
  /*处理处于圆上的点，目的：当点处于圆上时画区域存在问题，这里取巧，将点沿着半径内移1px*/
  resolvePoint(point){
    const {x,y} = point;
    const heightY =  y - this.y;
    const widthX =  x - this.x;
    const side = Math.sqrt(heightY * heightY + widthX * widthX); // 求出斜边长
    if(Math.floor(side) === Math.floor(this.arm)){ // 确实是圆上的点
      if(!heightY){ // 水平方向
        return {x:x + (widthX >= 0 ? -1 : 1),y:y};
      }else if(!widthX){ // 垂直方向
        return {x:x,y:y + (heightY >= 0 ? -1 : 1)};
      }else{ // 其他方向
        const tan = Math.atan(Math.abs(heightY)/Math.abs(widthX)); //求出弧度值
        const newArm = this.arm - 1;
        const newY = Math.sin(tan) * newArm * (heightY >= 0 ? 1 : -1);
        const newX = Math.cos(tan) * newArm * (widthX >= 0 ? 1 : -1);
        return {x:newX + this.x,y:newY + this.y};
      }
    }
    return point;
  }
}


