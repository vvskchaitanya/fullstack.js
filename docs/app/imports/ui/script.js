
Loader.init();
Logger.init();
Pages.init();
//Firebase.init();

load=function(){
    Pages.go(window.location.pathname.substring(1));
}
