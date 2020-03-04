/*eslint-disable*/
import {message} from "antd/lib/index";
import info from '@/defaultInfo';
let ws = null;
let cb = null;
const linkWebSocket = (params) => {
  const Authorization = sessionStorage.getItem('Authorization');
  ws = new WebSocket(`ws://${window.location.host}${info.isIron ? '/crane' : ''}/restful/v2/params?Authorization=${Authorization}`);
  //ws = new WebSocket(`ws://118.24.68.117:18066/restful/v2/params?Authorization=${Authorization}`);
  //ws = new WebSocket(`ws://192.168.1.25:18066/restful/v2/params?Authorization=${Authorization}`);
  ws.onopen = (e) => {
    sendCmd(params,cb);
    console.log('链接成功');
  };
  ws.onmessage = (res) => {
    !!cb && cb(res.data);
  };
  ws.onerror = (e) => {
    message.error('操作失败！');
    console.log('链接失败');
  };
  ws.onclose = () => {
    console.log('链接关闭');
  };
};
/*发送命令*/
const sendCmd = (message,callback) => {
  cb = callback;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }else{
    linkWebSocket(message);
  }
};
const closeSocket = () => {
  if(ws){
    ws.close()
  }
};
export {sendCmd,closeSocket};
