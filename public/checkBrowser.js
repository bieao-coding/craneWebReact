(function(){
  function isIE() {
    if(!!window.ActiveXObject || "ActiveXObject" in window){
      location.href = '/checkBrowser.html'
    }
  }
  isIE();
})()
