(function(){
  var D=window.SERO, root=document.documentElement;

  /* ---- Toast ---- */
  var toast=document.getElementById('toast'),tt;
  function say(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},2600)}

  /* ---- Theme switch (dark is the default brand look) ---- */
  var themeBtn=document.getElementById('themeBtn'),themeLbl=themeBtn.querySelector('.theme-lbl');
  function isLight(){
    var t=root.dataset.theme;
    return t?t==='light':window.matchMedia('(prefers-color-scheme: light)').matches;
  }
  function syncTheme(){
    var light=isLight();
    themeBtn.setAttribute('aria-checked',String(light));
    themeLbl.textContent=light?'Dark mode':'Light mode';
    themeBtn.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
  }
  themeBtn.addEventListener('click',function(){
    var next=isLight()?'dark':'light';
    root.dataset.theme=next;
    try{localStorage.setItem('sero-theme',next)}catch(e){}
    syncTheme();
  });
  syncTheme();

  /* ---- Mobile menu ---- */
  var menuBtn=document.getElementById('menuBtn'),nav=document.getElementById('nav');
  function setMenu(open){
    nav.classList.toggle('open',open);
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.textContent=open?'Close':'Menu';
  }
  menuBtn.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  nav.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){setMenu(false);menuBtn.focus()}});

  /* ---- Header shadow on scroll ---- */
  var head=document.querySelector('.site-head');
  function onScroll(){head.classList.toggle('scrolled',window.scrollY>8)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* ---- Module cards ---- */
  document.getElementById('modGrid').innerHTML=D.modules.map(function(m,i){
    return '<article class="mod-card"><span class="mod-n">0'+(i+1)+'</span><h3>'+m.n.replace('&','&amp;')+'</h3>'+
      '<p class="mod-short">'+m.short+'</p><dl><dt>The problem</dt><dd>'+m.problem+'</dd><dt>What it does</dt><dd>'+m.does+'</dd></dl>'+
      '<button class="mod-try" type="button" data-try="'+m.id+'">Try it in the dashboard →</button></article>';
  }).join('');

  /* ---- Live dashboard demo ---- */
  var host=document.getElementById('app');
  var st={mod:'analytics',range:'7d',bar:-1,driver:0,promo:D.promos.map(function(p){return p.on}),stamps:7,redeemed:0,sent:[],
    menu:D.menu.map(function(m){return m[4]}),rev:0,tone:'warm',v:0,replied:[]};

  function money(n){return '$'+n.toLocaleString('en-US')}
  function count(a){return a.filter(Boolean).length}
  function icon(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
  function head2(t,s){return '<div class="a-h"><h3>'+t+'</h3><small>'+s+'</small></div>'}
  function sw(on,attr,label){return '<button class="a-sw" type="button" role="switch" aria-checked="'+on+'" '+attr+' aria-label="'+label+'"></button>'}

  var PANES={
    analytics:function(){
      var R=D.range[st.range],max=Math.max.apply(null,R.bars);
      return head2('Analytics Dashboard','Every module, in one view.')+
        '<div class="a-seg" role="group" aria-label="Date range"><button type="button" data-range="7d" aria-pressed="'+(st.range==='7d')+'">7 days</button><button type="button" data-range="30d" aria-pressed="'+(st.range==='30d')+'">30 days</button></div>'+
        '<div class="a-kpis">'+R.k.map(function(k,i){return '<div class="a-card a-kpi"><small>'+k[0]+'</small><b>'+k[1]+'</b><em>'+k[2]+'</em></div>'}).join('')+'</div>'+
        '<div class="a-card"><div class="a-chart-h"><b>Revenue</b><span>'+(st.bar>=0?R.lab[st.bar]+' · '+money(R.bars[st.bar]):'Tap a bar')+'</span></div><div class="a-bars">'+
        R.bars.map(function(v,i){return '<button type="button" data-bar="'+i+'" class="'+(i===st.bar?'on':'')+'" style="--h:'+Math.round(v/max*100)+'%" aria-label="'+R.lab[i]+', '+money(v)+'"><i></i><span>'+R.lab[i]+'</span></button>'}).join('')+'</div></div>'+
        '<div class="a-shorts">'+
          '<button type="button" class="a-short" data-mod-go="insights"><small>Top reason guests leave</small><b>Morning waits</b></button>'+
          '<button type="button" class="a-short" data-mod-go="promos"><small>Promotions running</small><b>'+count(st.promo)+'</b></button>'+
          '<button type="button" class="a-short" data-mod-go="loyalty"><small>Regulars at risk</small><b>'+(D.atRisk.length-st.sent.length)+'</b></button>'+
          '<button type="button" class="a-short" data-mod-go="replies"><small>Reviews to answer</small><b>'+(D.reviews.length-st.replied.length)+'</b></button>'+
        '</div>';
    },
    insights:function(){
      var d=D.drivers[st.driver],F=D.funnel;
      return head2('AI Customer Insights','Why guests don’t come back, ranked by lost visits.')+
        '<div class="a-grid2"><div class="a-card"><b class="a-ct">Why customers leave</b><ul class="a-drivers">'+
        D.drivers.map(function(x,i){return '<li><button type="button" data-driver="'+i+'" aria-pressed="'+(i===st.driver)+'" style="--w:'+Math.round(x.p/D.drivers[0].p*100)+'%"><i></i><span>'+x.n+'</span><em>'+x.p+'%</em></button></li>'}).join('')+'</ul></div>'+
        '<div class="a-card a-ai"><span class="a-tag">✦ AI insight</span><p>'+d.d+'</p><p><b>Suggested fix:</b> '+d.a+'</p>'+(d.go?'<button type="button" class="a-btn" data-mod-go="'+d.go[0]+'">'+d.go[1]+' →</button>':'')+'</div></div>'+
        '<div class="a-card"><b class="a-ct">Customer journey · last 30 days</b><ol class="a-funnel">'+
        F.map(function(f,i){return '<li style="--w:'+Math.max(8,Math.round(f[1]/F[0][1]*100))+'%"><span>'+f[0]+'</span><b>'+f[1].toLocaleString('en-US')+'</b>'+(i?'<em>'+Math.round(f[1]/F[i-1][1]*100)+'% of the step before</em>':'')+'</li>'}).join('')+'</ol></div>';
    },
    promos:function(){
      var lift=D.promos.reduce(function(t,p,i){return t+(st.promo[i]?p.lift:0)},0);
      return head2('Smart Promotions','Targeted offers, switched on in one tap.')+
        '<div class="a-kpis a-two"><div class="a-card a-kpi"><small>Running now</small><b>'+count(st.promo)+' of '+D.promos.length+'</b></div><div class="a-card a-kpi"><small>Projected lift / week</small><b>+'+money(lift)+'</b></div></div>'+
        '<ul class="a-list">'+D.promos.map(function(p,i){return '<li class="a-card a-row"><div><b>'+p.n+'</b><small>'+p.s+' · est. +'+money(p.lift)+'/wk</small></div>'+sw(st.promo[i],'data-promo="'+i+'"',p.n)+'</li>'}).join('')+'</ul>';
    },
    loyalty:function(){
      var full=st.stamps>=10,stamps='';
      for(var i=0;i<10;i++)stamps+='<i class="'+(i<st.stamps?'on':'')+'"></i>';
      return head2('Loyalty &amp; Rewards','Know your regulars, and notice when they drift.')+
        '<div class="a-kpis a-three"><div class="a-card a-kpi"><small>Members</small><b>642</b></div><div class="a-card a-kpi"><small>Visits this month</small><b>1,930</b></div><div class="a-card a-kpi"><small>Rewards redeemed</small><b>'+(87+st.redeemed)+'</b></div></div>'+
        '<div class="a-grid2"><div class="a-card"><b class="a-ct">Stamp card · Maya R.</b><div class="a-stamps" role="img" aria-label="'+st.stamps+' of 10 stamps">'+stamps+'</div><p class="a-muted">'+(full?'Free drink unlocked 🎉':(10-st.stamps)+' more for a free drink')+'</p><button type="button" class="a-btn" data-stamp="1">'+(full?'Redeem reward':'Add a stamp')+'</button></div>'+
        '<div class="a-card"><b class="a-ct">Regulars at risk</b><ul class="a-people">'+D.atRisk.map(function(x,i){var sent=st.sent.indexOf(i)>=0;
          return '<li><span class="a-av" aria-hidden="true">'+x[0].charAt(0)+'</span><div><b>'+x[0]+'</b><small>'+x[1]+'</small></div><button type="button" class="a-btn a-sm" data-send="'+i+'"'+(sent?' disabled':'')+'>'+(sent?'Sent ✓':'Send reward')+'</button></li>'}).join('')+'</ul></div></div>';
    },
    menu:function(){
      return head2('Menu Management','What sells, what earns, and what to change.')+
        '<div class="a-card a-ai"><span class="a-tag">✦ AI tip</span><p>Matcha Latte is up 24% this week, so feature it in a promotion. Avocado Toast has the lowest margin (34%) and is down 11%, so review its price.</p></div>'+
        '<div class="a-card a-tbl"><div class="a-tr a-th"><span>Item</span><span class="c2">Sold</span><span class="c3">Margin</span><span>Trend</span><span>On menu</span></div>'+
        D.menu.map(function(m,i){return '<div class="a-tr'+(st.menu[i]?'':' off')+'"><span>'+m[0]+'</span><span class="c2">'+m[1]+'</span><span class="c3">'+m[2]+'%</span><span class="'+(m[3]>=0?'a-up':'a-down')+'">'+(m[3]>=0?'▲ ':'▼ ')+Math.abs(m[3])+'%</span><span>'+sw(st.menu[i],'data-item="'+i+'"',m[0]+' on menu')+'</span></div>'}).join('')+'</div>';
    },
    replies:function(){
      var r=D.reviews[st.rev],done=st.replied.indexOf(st.rev)>=0,first=r.who.split(' ')[0];
      var draft=D.open[st.tone][st.v].replace('{n}',first)+' '+r.body+D.close[st.tone];
      return head2('AI-generated response','On-brand replies, drafted in seconds.')+
        '<div class="a-grid2"><ul class="a-list">'+D.reviews.map(function(x,i){var d=st.replied.indexOf(i)>=0;
          return '<li><button type="button" class="a-card a-review'+(i===st.rev?' on':'')+'" data-rev="'+i+'" aria-pressed="'+(i===st.rev)+'"><span class="a-stars" aria-label="'+x.st+' out of 5 stars">'+'★★★★★'.slice(0,x.st)+'<s>'+'★★★★★'.slice(x.st)+'</s></span><b>'+x.who+' · '+x.src+'</b><small>'+x.t+'</small><em class="'+(d?'ok':'')+'">'+(d?'Replied':'Needs a reply')+'</em></button></li>'}).join('')+'</ul>'+
        '<div class="a-card"><b class="a-ct">Reply to '+first+'</b><div class="a-chips" role="group" aria-label="Tone">'+['warm','professional','short'].map(function(t){return '<button type="button" data-tone="'+t+'" aria-pressed="'+(st.tone===t)+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('')+'</div>'+
        '<textarea aria-label="Draft reply" rows="6">'+draft+'</textarea><div class="a-acts"><button type="button" class="a-btn a-ghost" data-regen="1">↻ Regenerate</button><button type="button" class="a-btn" data-post="1"'+(done?' disabled':'')+'>'+(done?'Posted ✓':'Post reply')+'</button></div></div></div>';
    }
  };

  host.innerHTML='<div class="a-top"><div><small>Sample data · this week</small><h3 class="a-hello">Good morning</h3></div><span class="a-live"><i></i>Live</span></div>'+
    '<div class="a-app"><nav class="a-nav" aria-label="Dashboard modules">'+D.nav.map(function(m){return '<button type="button" data-mod="'+m[0]+'">'+icon(m[2])+'<span>'+m[1]+'</span></button>'}).join('')+'</nav><div class="a-main" aria-live="polite"></div></div>';
  var main=host.querySelector('.a-main');

  function render(){
    host.querySelectorAll('.a-nav button').forEach(function(b){b.setAttribute('aria-current',b.dataset.mod===st.mod?'true':'false')});
    main.innerHTML=PANES[st.mod]();
  }

  host.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!host.contains(b)||b.disabled)return;
    var d=b.dataset,had=document.activeElement===b,key=Object.keys(d)[0];
    if(d.mod){st.mod=d.mod}
    else if(d.modGo){st.mod=d.modGo;had=false}
    else if(d.range){st.range=d.range;st.bar=-1}
    else if(d.bar){st.bar=+d.bar}
    else if(d.driver){st.driver=+d.driver}
    else if(d.promo){var i=+d.promo;st.promo[i]=!st.promo[i];say(st.promo[i]?'Promotion switched on':'Promotion paused')}
    else if(d.stamp){if(st.stamps>=10){st.stamps=0;st.redeemed++;say('Reward redeemed 🎉')}else st.stamps++}
    else if(d.send){st.sent.push(+d.send);say('Reward sent to '+D.atRisk[+d.send][0])}
    else if(d.item){var j=+d.item;st.menu[j]=!st.menu[j];say(D.menu[j][0]+(st.menu[j]?' is back on the menu':' marked sold out'))}
    else if(d.rev){st.rev=+d.rev;st.v=0}
    else if(d.tone){st.tone=d.tone;st.v=0}
    else if(d.regen){st.v=(st.v+1)%2}
    else if(d.post){st.replied.push(st.rev);say('Reply posted to '+D.reviews[st.rev].src)}
    else return;
    render();
    /* keep keyboard focus on the control that was just re-rendered */
    if(had&&key){var nb=host.querySelector('[data-'+key.replace(/[A-Z]/g,function(c){return '-'+c.toLowerCase()})+'="'+d[key]+'"]');if(nb)nb.focus({preventScroll:true})}
  });
  render();

  /* "Try it" on a module card opens that pane in the dashboard */
  document.getElementById('modGrid').addEventListener('click',function(e){
    var b=e.target.closest('[data-try]');if(!b)return;
    st.mod=b.dataset.try;render();
    document.getElementById('dashboard').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    var nb=host.querySelector('[data-mod="'+st.mod+'"]');if(nb)nb.focus({preventScroll:true});
  });

  /* ---- Book a demo (Netlify Forms, submitted without leaving the page) ---- */
  var form=document.querySelector('.demo-form'),msg=form.querySelector('.form-msg');
  var local=location.protocol==='file:'||/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(local){msg.textContent='Local preview: the form is wired up, but submissions only work once the site is hosted on Netlify.';return}
    var btn=form.querySelector('button[type="submit"]');
    btn.disabled=true;msg.textContent='Sending…';
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
      .then(function(r){if(!r.ok)throw new Error(r.status);
        form.reset();msg.textContent='Thanks! We’ll be in touch within one business day to book your demo. ☕';})
      .catch(function(){msg.textContent='Something went wrong. Please try again, or email us directly.'})
      .then(function(){btn.disabled=false});
  });

  document.getElementById('yr').textContent=new Date().getFullYear();
})();
