(function(){
  function isIE() {
    if(!!window.ActiveXObject || "ActiveXObject" in window){
<<<<<<< HEAD
      window.location.href = '/checkBrowser.html'
=======
      location.href = '/checkBrowser.html'
>>>>>>> 55c339e0f6caedb2e7ee70f944aaa8cd05c485ae
    }
  }
  isIE();
})()
