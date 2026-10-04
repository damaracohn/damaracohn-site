/* Dropdown menus: tap/click to open, Escape or outside tap to close. Links are plain <a> so they stay crawlable. */
(function(){
  var items=document.querySelectorAll('.has-sub');
  if(!items.length) return;
  function closeAll(except){
    items.forEach(function(li){
      if(li!==except){li.classList.remove('open');var b=li.querySelector('.sub-toggle');if(b)b.setAttribute('aria-expanded','false');}
    });
  }
  items.forEach(function(li){
    var btn=li.querySelector('.sub-toggle');
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var open=!li.classList.contains('open');
      closeAll(li);
      li.classList.toggle('open',open);
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.has-sub')) closeAll();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      var o=document.querySelector('.has-sub.open>.sub-toggle');
      closeAll();
      if(o) o.focus();
    }
  });
  var links=document.getElementById('navLinks');
  if(links){links.addEventListener('click',function(e){if(e.target.closest('a')){closeAll();links.classList.remove('open');}});}
})();
