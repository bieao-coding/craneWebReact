/*eslint-disable*/
import * as PIXI from 'pixi.js'
import pingCrane from './../../../../assets/images/pingCrane.png'
import line from './../../../../assets/images/line.png'
import hook from './../../../../assets/images/hook.png'
import cargo from './../../../../assets/images/cargo.png'
import car from './../../../../assets/images/car.png'
export default class PingSideView{
  sideView = null;
  loader = null;
  Sprite = PIXI.Sprite;
  widthMinScale = 0.284;//塔机尾部到驾驶室的占画布的比例
  widthMaxScale = 0.969;//塔机臂头占画布的比例
  heightMinScale = 0.086;//塔机顶到臂下线占画布的比例
  heightMaxScale = 0.985;//塔机底占画布的比例
  widthBeginPosition;
  widthEndPosition;
  heightBeginPosition;
  heightEndPosition;
  oldAnimationData = {lineHeight:0,radius:0,loadValue:0};//保存之前的数据
  newAnimationData = {lineHeight:0,radius:0,loadValue:0};//新数据
  cargo;//货物
  car;
  hook;
  line;
  canvasWidth;
  canvasHeight;
  armLengthScale;//塔机臂的比例尺
  lineScale;//塔机比例尺
  floorHeight = 30;//地面的高度
  halfCar = 11;//小车的一半宽度
  halfHook = 8;//挂钩的一半
  hookHeight = 23;//挂钩的本身高度
  carEndMove = 0;
  lineEndMove = 0;
  carMove = 0;
  lineMove = 0;
  lineFlag = false;
  carFlag = false;
  oldCargo = 0;
  cargoValue = 0;
  /*画图*/
  init({canvasWidth,canvasHeight,armLength,towerHeight,scale,loader,sideView,height,radius,loadValue}) {
    this.sideView = sideView;
    this.loader = loader;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.widthBeginPosition = this.canvasWidth * this.widthMinScale;
    this.widthEndPosition = this.canvasWidth * this.widthMaxScale;
    this.armLengthScale = (this.widthEndPosition - this.widthBeginPosition)/armLength;
    this.heightBeginPosition = this.canvasHeight * this.heightMinScale;
    this.heightEndPosition = this.canvasHeight * this.heightMaxScale;
    this.lineScale = (this.heightEndPosition - this.heightBeginPosition)/towerHeight;
    if(!PIXI.utils.TextureCache.pingCrane){
      if(!PIXI.utils.TextureCache.line){
        this.loader
          .add('pingCrane',pingCrane)
          .add('line',line)
          .add('car',car)
          .add('cargo',cargo)
          .add('hook',hook)
          .load(()=>{
            this.setUp(height,radius,loadValue,scale);
          });
      }else{
        this.loader
          .add('pingCrane',pingCrane)
          .add('car',car)
          .load(()=>{
            this.setUp(height,radius,loadValue,scale);
          });
      }
    }else{
      this.setUp(height,radius,loadValue,scale);
    }
  }
  setUp(height,radius,loadValue,scale){
    const crane = new this.Sprite(this.loader.resources.pingCrane.texture);
    this.line = new this.Sprite(this.loader.resources.line.texture);
    this.car = new this.Sprite(this.loader.resources.car.texture);
    this.cargo = new this.Sprite(this.loader.resources.cargo.texture);
    this.hook = new this.Sprite(this.loader.resources.hook.texture);
    this.car.position.set(this.widthBeginPosition,this.heightBeginPosition - 11);
    this.line.position.set(this.car.x + this.halfCar,this.heightBeginPosition + 4);
    this.line.height = 0;
    this.hook.position.set(this.car.x + this.halfHook,this.line.height + this.line.y);//初始位置
    this.cargo.scale.set(0.5,0.5);
    this.cargo.position.set(-100,this.canvasHeight - this.floorHeight - this.cargo.height);//初始位置
    const machine = new PIXI.Container();
    machine.addChild(crane);
    machine.addChild(this.line);
    machine.addChild(this.car);
    machine.addChild(this.cargo);
    machine.addChild(this.hook);
    machine.scale.set(scale);
    this.sideView.stage.addChild(machine);
    this.oldAnimationData = {lineHeight:0,radius:this.widthBeginPosition,loadValue:0};
    this.update({height:height,radius:radius,loadValue:loadValue});
    this.animation();
  }
  /*动画*/
  animation(){
    const self = this;
    this.sideView.ticker.add(function(delta){
      if(self.lineFlag && self.carFlag){
        self.lineFlag = false;
        self.carFlag = false;
        self.sideView.ticker.stop();
      }else {
        if (Math.abs(self.carEndMove - self.car.x) <= Math.abs(self.carMove)) {
          self.car.x = self.carEndMove;
          self.carFlag = true;
        } else {
          self.car.x += self.carMove * delta;
        }
        if (Math.abs(self.lineEndMove - self.line.height) <= Math.abs(self.lineMove) || self.lineFlag ||  !self.lineMove) {
          self.line.x = self.car.x + self.halfCar;
          self.hook.x = self.car.x + self.halfHook;
          if(self.cargoValue > 0){//存在货物
            if((self.lineEndMove + self.hook.height + self.line.y + self.cargo.height) >= self.heightEndPosition){
              self.line.height = self.heightEndPosition - self.line.y - self.hook.height - self.cargo.height;
            }else{
              self.line.height = self.lineEndMove;
            }
            self.hook.y = self.line.y + self.line.height;
            self.cargo.y = self.hook.y + self.hook.height - 1;
            self.cargo.x = self.car.x  + 1;
          }else{//防止钩子超过地面
            self.cargo.position.set(-100, self.canvasHeight - self.floorHeight - self.cargo.height);
            if((self.lineEndMove + self.hook.height + self.line.y) >= self.heightEndPosition){
              self.line.height = self.heightEndPosition - self.line.y - self.hook.height;
            }else{
              self.line.height = self.lineEndMove;
            }
            self.hook.y = self.line.y + self.line.height;
          }
          // if(!self.carMove){//只有绳子在动
          //   if(self.cargoValue <= 0){
          //     self.cargo.position.set(-100, self.canvasHeight - self.floorHeight - self.cargo.height);
          //   }else{
          //     self.cargo.x = self.car.x + 1;
          //     self.cargo.y = self.hook.y + self.hook.height - 1;
          //   }
          // }
          // if(!self.lineMove){//只有小车在动
          //   if(self.carFlag){
          //     if(self.cargoValue <= 0){
          //       self.cargo.position.set(-100, self.canvasHeight - self.floorHeight - self.cargo.height);
          //     }else{
          //       self.cargo.x = self.car.x  + 1;
          //       self.cargo.y = self.hook.y + self.hook.height - 1;
          //     }
          //   }else{
          //     if(self.oldCargo > 0){
          //       if(self.cargoValue <= 0 || self.oldCargo === self.cargoValue){
          //         self.cargo.x = self.car.x  + 1;
          //         self.cargo.y = self.hook.y + self.hook.height - 1;
          //       }
          //     }
          //   }
          // }
          // if(self.cargoValue > 0){//存在货物超过地面
          //   if((self.hook.y + self.hookHeight + self.cargo.height) >= self.heightEndPosition){
          //     self.line.height = self.heightEndPosition - self.line.y - self.hookHeight - self.cargo.height;
          //     self.hook.y = self.line.y + self.line.height;
          //     self.cargo.y = self.hook.y + self.hook.height - 1;
          //     self.cargo.x = self.car.x  + 1;
          //   }else if(self.lineMove){
          //     self.cargo.y = self.hook.y + self.hook.height - 1;
          //     self.cargo.x = self.car.x  + 1;
          //   }
          // }else{//防止钩子超过地面
          //   if(Math.abs(self.lineEndMove - self.line.height) <= Math.abs(self.lineMove)){
          //     self.cargo.position.set(-100, self.canvasHeight - self.floorHeight - self.cargo.height);
          //   }
          //   if((self.hook.y + self.hookHeight) >= self.heightEndPosition){
          //     self.line.height = self.heightEndPosition - self.line.y - self.hookHeight;
          //     self.hook.y = self.line.y + self.line.height;
          //   }
          // }
          self.lineFlag = true;
        } else {
          self.line.height += self.lineMove * delta;
          self.hook.y = self.line.y + self.line.height;
          self.line.x = self.car.x + self.halfCar;
          self.hook.x = self.car.x + self.halfHook;
          if (self.oldCargo > 0) {//原来有货物
            if (self.cargoValue > 0) {//现在有货物
              if (self.lineMove > 0) {//下降状态
                if ((self.hook.y + self.hook.height + self.cargo.height) >= self.heightEndPosition) {
                  self.lineFlag = true;
                } else {
                  self.cargo.y = self.hook.y + self.hook.height - 1;
                  self.cargo.x = self.car.x  + 1;
                }
              } else {//上升状态
                if ((self.heightEndPosition - self.hook.y - self.hook.height) > self.cargo.height) {
                  self.cargo.y = self.hook.y + self.hook.height - 1;
                  self.cargo.x = self.car.x  + 1;
                }
              }
            } else {//现在没有货物
              if ((self.hook.y + self.hook.height + self.cargo.height) >= self.heightEndPosition) {
                self.cargo.position.set(-100, self.canvasHeight - self.floorHeight - self.cargo.height);//先卸货
                if (self.hook.y + self.hook.height >= self.heightEndPosition) {
                  self.lineFlag = true;
                }
              } else {
                self.cargo.y = self.hook.y + self.hook.height - 1;
                self.cargo.x = self.car.x  + 1;
              }
            }
          } else {//原来没有货物
            if (self.cargoValue > 0) {//现在有货物
              if (self.lineMove < 0) {//绳子是上升状态
                if ((self.heightEndPosition - self.hook.y - self.hook.height) > self.cargo.height) {
                  self.cargo.y = self.hook.y + self.hook.height - 1;
                  self.cargo.x = self.car.x  + 1;
                }
              } else {//绳子是下降状态
                if ((self.heightEndPosition - self.hook.y - self.hook.height) <= self.cargo.height) {
                  self.cargo.y = self.hook.y + self.hook.height - 1;
                  self.cargo.x = self.car.x  + 1;
                  self.lineFlag = true;
                }
              }
            } else {//现在没有货物
              if (self.hook.y + self.hook.height >= self.heightEndPosition) {
                self.lineFlag = true;
              }
            }
          }
        }
      }
    });
  }
  /*更新*/
  update({height,radius,loadValue}){
    this.sideView.ticker.speed = 1;
    this.newAnimationData = {lineHeight:height * this.lineScale,radius:radius * this.armLengthScale + this.widthBeginPosition,loadValue:loadValue};
    this.carMove = (this.newAnimationData.radius - this.oldAnimationData.radius) / 100;
    this.lineMove = (this.newAnimationData.lineHeight - this.oldAnimationData.lineHeight) / 100;
    this.carEndMove = this.newAnimationData.radius;
    this.lineEndMove = this.newAnimationData.lineHeight;
    this.oldCargo = this.oldAnimationData.loadValue;
    this.cargoValue = this.newAnimationData.loadValue;
    this.lineFlag = false;
    this.carFlag = false;
    this.sideView.ticker.start();
    this.oldAnimationData = this.newAnimationData;
  }
}
