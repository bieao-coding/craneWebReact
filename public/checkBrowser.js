(function(){
  function isIE() {
    if(!!window.ActiveXObject || "ActiveXObject" in window){
      window.location.href = '/checkBrowser.html'
    }
  }
  isIE();
})()
