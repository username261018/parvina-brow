/* Parvina Brow · motion engine (vanilla, no deps) */
(function(){
  var d=document, h=d.documentElement, on=h.classList.contains('m-on');
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  /* top bar height -> --top-h */
  var top=d.querySelector('.topbar');
  function setTop(){ if(top) h.style.setProperty('--top-h', top.offsetHeight+'px'); }
  setTop(); if(window.ResizeObserver && top) new ResizeObserver(setTop).observe(top);
  /* menu */
  var mb=d.querySelector('.burger'), nav=d.getElementById('menu');
  if(mb&&nav){
    function close(){ mb.setAttribute('aria-expanded','false'); nav.classList.remove('open'); }
    mb.addEventListener('click',function(){ var o=mb.getAttribute('aria-expanded')==='true'; mb.setAttribute('aria-expanded',String(!o)); nav.classList.toggle('open',!o); });
    nav.addEventListener('click',function(e){ if(e.target.closest('a')) close(); });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape'&&nav.classList.contains('open')){ close(); mb.focus(); } });
    matchMedia('(min-width:900px)').addEventListener('change',close);
  }
  /* maps: click to load */
  d.querySelectorAll('[data-map]').forEach(function(b){
    b.addEventListener('click',function(){
      var box=b.closest('.map'), f=d.createElement('iframe');
      f.src=b.getAttribute('data-map'); f.title=b.getAttribute('data-title')||'Карта'; f.loading='lazy'; f.allowFullscreen=true;
      box.innerHTML=''; box.appendChild(f); box.classList.add('loaded');
    });
  });
  if(!on) return;
  /* split headings into words */
  d.querySelectorAll('[data-words]').forEach(function(el){
    var txt=el.textContent.replace(/\s+/g,' ').trim(), step=el.tagName==='H1'?70:60;
    var sr=d.createElement('span'); sr.className='sr'; sr.textContent=txt;
    var vis=d.createElement('span'); vis.setAttribute('aria-hidden','true');
    var lines=el.querySelectorAll('[data-line]');
    var groups=lines.length?Array.prototype.map.call(lines,function(l){return {cls:l.className,t:l.textContent.trim()}}):[{cls:'',t:txt}];
    var n=0;
    groups.forEach(function(g){
      var wrap=d.createElement('span'); if(g.cls) wrap.className=g.cls;
      g.t.split(' ').forEach(function(w,i){
        var s=d.createElement('span'); s.className='w'; var x=d.createElement('span'); x.className='wi'; x.textContent=w;
        x.style.transitionDelay=(n++*step)+'ms'; s.appendChild(x); wrap.appendChild(s); wrap.appendChild(d.createTextNode(' '));
      });
      vis.appendChild(wrap);
    });
    el.textContent=''; el.appendChild(sr); el.appendChild(vis); el.setAttribute('data-rv','');
  });
  /* stagger index */
  d.querySelectorAll('[data-stagger]').forEach(function(p){ Array.prototype.forEach.call(p.children,function(c,i){ c.style.setProperty('--i',i); if(!c.hasAttribute('data-rv')) c.setAttribute('data-rv',''); }); });
  /* curtains: release clip after reveal */
  d.querySelectorAll('[data-cur]').forEach(function(f){
    f.addEventListener('transitionend',function(e){ if(e.target===f && e.propertyName==='clip-path') f.classList.add('done'); });
  });
  var all=[].slice.call(d.querySelectorAll('[data-rv],[data-cur],[data-pin],.ln'));
  function show(el){ if(!el.classList.contains('in')){ el.classList.add('in'); if(el.hasAttribute('data-cur')) setTimeout(function(){el.classList.add('done')},1600); } }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
  /* hero chain: starts 300 ms after DOMContentLoaded */
  var hero=d.querySelector('.hero');
  setTimeout(function(){
    all.forEach(function(el){ if(hero&&hero.contains(el)) show(el); else io.observe(el); });
    sweep();
  },300);
  function sweep(){ var vh=innerHeight; all.forEach(function(el){ if(!el.classList.contains('in') && el.getBoundingClientRect().top<vh) show(el); }); }
  ['scroll','load','hashchange','resize'].forEach(function(ev){ addEventListener(ev,function(){ requestAnimationFrame(sweep); },{passive:true}); });
  addEventListener('beforeprint',function(){ all.forEach(show); });
  /* scroll-linked: lit paragraph + final panel (both ways, rAF only while scrolling) */
  var lit=d.querySelector('[data-lit]'), words=[];
  if(lit){ var t=lit.textContent.trim().split(/\s+/); lit.setAttribute('aria-label',lit.textContent.trim()); lit.textContent='';
    t.forEach(function(w){ var s=d.createElement('span'); s.textContent=w+' '; s.setAttribute('aria-hidden','true'); lit.appendChild(s); words.push(s); }); }
  var panel=d.querySelector('[data-panel]'), ticking=false;
  function frame(){
    ticking=false; var vh=innerHeight;
    if(lit){ var r=lit.getBoundingClientRect(), p=Math.min(1,Math.max(0,(vh*0.85-r.top)/(vh*0.5))), k=p*words.length;
      for(var i=0;i<words.length;i++){ words[i].style.opacity=Math.max(.25,Math.min(1,k-i+1)).toFixed(2); } }
    if(panel){ var pr=panel.getBoundingClientRect(), q=Math.min(1,Math.max(0,(vh-pr.top)/(vh*0.6))); panel.style.setProperty('--fx',(48*(1-q)).toFixed(1)+'px'); }
  }
  addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } },{passive:true});
  frame();
  /* scramble captions (T4): noise twin resolves to the real text */
  var N='абвгдежзиклмнопрстуфхцчшщыэюя#/+=-';
  d.querySelectorAll('[data-scr]').forEach(function(el){
    var real=el.querySelector('.real'), tw=el.querySelector('.twin'); if(!real||!tw) return;
    var txt=real.textContent, done=false;
    function run(){ if(done) return; done=true; var st=performance.now();
      (function f(now){ var p=Math.min(1,(now-st)/900), n=Math.floor(p*txt.length), o='';
        for(var i=0;i<txt.length;i++){ o+= i<n||txt[i]===' ' ? txt[i] : N[(Math.random()*N.length)|0]; }
        tw.textContent=o; if(p<1) requestAnimationFrame(f); else el.classList.add('ok'); })(st); }
    el.classList.add('scr-on'); tw.textContent=txt.replace(/\S/g,'·');
    var o=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ run(); o.disconnect(); } }); o.observe(el);
    setTimeout(function(){ if(el.getBoundingClientRect().top<innerHeight) run(); },400);
  });
  /* fine pointer: light spot + tilt */
  if(fine){
    var spot=d.querySelector('.spot'), sx=0, sy=0, raf=0;
    var tilt=[].slice.call(d.querySelectorAll('[data-tilt]'));
    addEventListener('pointermove',function(e){ sx=e.clientX; sy=e.clientY; if(!raf) raf=requestAnimationFrame(move); },{passive:true});
    function move(){ raf=0; if(spot) spot.style.transform='translate('+(sx-300)+'px,'+(sy-300)+'px)';
      tilt.forEach(function(t){ var r=t.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight) return;
        var dx=(sx-(r.left+r.width/2))/innerWidth, dy=(sy-(r.top+r.height/2))/innerHeight;
        t.style.setProperty('--tx',(dx*6).toFixed(2)+'deg'); t.style.setProperty('--ty',(-dy*6).toFixed(2)+'deg'); }); }
  }
  h.classList.add('m-ready');
})();
