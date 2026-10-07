
/* Sero prototypes */
(function(){
  /* ---- Sample data for the dashboard ---- */
  var NAV=[['analytics','Analytics','<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>'],
    ['insights','Insights','<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'],
    ['promos','Promotions','<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>'],
    ['loyalty','Loyalty','<path d="M12 20s-7.5-4.8-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.2 12 20 12 20z"/>'],
    ['menu','Menu','<path d="M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>'],
    ['replies','Responses','<path d="M4 5h16v11H9l-5 4z"/>']];
  var RANGE={'7d':{bars:[980,1120,1040,1260,1390,1610,1020],lab:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      k:[['Revenue','$8,420','+6% vs last week'],['Customers','1,284','+4%'],['Return rate','38%','+3 pts'],['Revenue at risk','$1,150','−9%']]},
    '30d':{bars:[6900,7400,7850,8420],lab:['Wk 1','Wk 2','Wk 3','Wk 4'],
      k:[['Revenue','$30,570','+11% vs last month'],['Customers','4,960','+7%'],['Return rate','36%','+5 pts'],['Revenue at risk','$4,380','−14%']]}};
  var DRIVERS=[
    {n:'Long waits at morning peak',p:34,d:'Orders placed between 8 and 10am wait over 6 minutes on average. Guests who wait that long are 18% less likely to come back.',a:'Add a second barista from 8 to 10am.'},
    {n:'Price vs. portion',p:22,d:'“Small for the price” came up 41 times in reviews this month, mostly about sandwiches.',a:'Bundle a sandwich with a drink at a small discount.',go:['promos','Set up a bundle offer']},
    {n:'No seats at lunch',p:18,d:'Lunch visits drop on days the café is more than 85% full.',a:'Push takeaway at lunch with a pre-order offer.',go:['promos','See lunch offers']},
    {n:'Same menu every visit',p:14,d:'Three items make up 52% of repeat orders. Regulars say they “always get the same thing”.',a:'Rotate a weekly special.',go:['menu','Open the menu']},
    {n:'Rushed welcome',p:12,d:'Mostly positive, but 9 reviews mention a rushed hello at busy times.',a:'Share a quick greeting routine with the morning team.'}];
  var FUNNEL=[['Discovered you',3200],['First visit',1284],['Came back within 30 days',488],['Became a regular',211]];
  var PROMOS=[
    {n:'Win-back: 20% off',s:'212 guests away for 30+ days',lift:640,on:true},
    {n:'Rainy-day latte + pastry',s:'Runs when rain is forecast',lift:310,on:true},
    {n:'2-for-1 pastries, 2–4pm',s:'Everyone, weekdays',lift:420,on:false},
    {n:'Sandwich + drink bundle',s:'Lunch, 11am–2pm',lift:380,on:false},
    {n:'Birthday drink on us',s:'38 members this month',lift:190,on:true}];
  var AT_RISK=[['Maya R.','Daily regular · last visit 24 days ago'],['Jordan T.','Weekly · last visit 19 days ago'],['Priya S.','Regular · last visit 31 days ago'],['Sam K.','Weekly · last visit 22 days ago']];
  var MENU=[['Oat Latte',412,72,8],['Cold Brew',268,78,-3],['Matcha Latte',194,69,24],['Almond Croissant',231,58,5],['Avocado Toast',122,34,-11],['Banana Bread',96,64,2]];
  var REVIEWS=[
    {who:'Marcus D.',src:'Google',st:2,t:'Waited almost 10 minutes for a cold brew on a weekday morning. Coffee was good but I was late for work.',
     body:'We’re sorry about the wait. Mornings have been busy, so we’re adding a second barista from 8 to 10am to keep the line moving.'},
    {who:'Aisha K.',src:'Instagram',st:4,t:'Lovely space and great coffee, but the sandwiches feel small for the price.',
     body:'Thank you for the honest feedback on our sandwiches. We’re trying a sandwich and drink bundle so lunch feels like better value.'},
    {who:'Hannah L.',src:'Google',st:5,t:'Best oat latte in the neighbourhood, and the staff remembered my name!',
     body:'We’re so happy the oat latte hit the spot, and the team loved reading that they made you feel at home.'}];
  var OPEN={warm:['Hi {n}, thank you for taking the time to write.','Hey {n}, thanks so much for visiting.'],
    professional:['Dear {n}, thank you for your review.','Hello {n}, we appreciate your feedback.'],
    short:['Thanks, {n}!','Hi {n},']};
  var CLOSE={warm:' Hope to see you again soon.',professional:' We look forward to welcoming you back.',short:' – The team'};

  function money(n){return '$'+n.toLocaleString('en-US')}
  function icon(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
  function head(t,s){return '<div class="a-h"><b>'+t+'</b><small>'+s+'</small></div>'}
  function sw(on,attr,label){return '<button class="a-sw" type="button" role="switch" aria-checked="'+on+'" '+attr+' aria-label="'+label+'"></button>'}

  function initApp(ss,sc,say){
    var host=ss.querySelector('.ss-app');
    var st={mod:'analytics',range:'7d',bar:-1,driver:0,promo:PROMOS.map(function(p){return p.on}),stamps:7,redeemed:0,sent:[],
      menu:MENU.map(function(){return true}),rev:0,tone:'warm',v:0,replied:[]};
    st.menu[5]=false;
    host.innerHTML='<div class="a-top"><div><small>Sample data · this week</small><h5>Good morning</h5></div><span class="a-live"><i></i>Live</span></div>'+
      '<div class="a-app"><nav class="a-nav" aria-label="Dashboard modules">'+NAV.map(function(m){return '<button type="button" data-mod="'+m[0]+'">'+icon(m[2])+'<span>'+m[1]+'</span></button>'}).join('')+'</nav><div class="a-main" aria-live="polite"></div></div>';
    var main=host.querySelector('.a-main');
    function count(a){return a.filter(Boolean).length}

    var PANES={
      analytics:function(){
        var R=RANGE[st.range],max=Math.max.apply(null,R.bars);
        return head('Analytics Dashboard','Every module, in one view.')+
          '<div class="a-seg" role="group" aria-label="Date range"><button type="button" data-range="7d" aria-pressed="'+(st.range==='7d')+'">7 days</button><button type="button" data-range="30d" aria-pressed="'+(st.range==='30d')+'">30 days</button></div>'+
          '<div class="a-kpis">'+R.k.map(function(k){return '<div class="a-card a-kpi"><small>'+k[0]+'</small><b>'+k[1]+'</b><em>'+k[2]+'</em></div>'}).join('')+'</div>'+
          '<div class="a-card"><div class="a-chart-h"><b>Revenue</b><span>'+(st.bar>=0?R.lab[st.bar]+' · '+money(R.bars[st.bar]):'Tap a bar')+'</span></div><div class="a-bars">'+
          R.bars.map(function(v,i){return '<button type="button" data-bar="'+i+'" class="'+(i===st.bar?'on':'')+'" style="--h:'+Math.round(v/max*100)+'%" aria-label="'+R.lab[i]+', '+money(v)+'"><i></i><span>'+R.lab[i]+'</span></button>'}).join('')+'</div></div>'+
          '<div class="a-shorts">'+
            '<button type="button" class="a-short" data-mod-go="insights"><small>Top reason guests leave</small><b>Morning waits</b></button>'+
            '<button type="button" class="a-short" data-mod-go="promos"><small>Promotions running</small><b>'+count(st.promo)+'</b></button>'+
            '<button type="button" class="a-short" data-mod-go="loyalty"><small>Regulars at risk</small><b>'+(AT_RISK.length-st.sent.length)+'</b></button>'+
            '<button type="button" class="a-short" data-mod-go="replies"><small>Reviews to answer</small><b>'+(REVIEWS.length-st.replied.length)+'</b></button>'+
          '</div>';
      },
      insights:function(){
        var d=DRIVERS[st.driver];
        return head('AI Customer Insights','Why guests don’t come back, ranked by lost visits.')+
          '<div class="a-grid2"><div class="a-card"><b class="a-ct">Why customers leave</b><ul class="a-drivers">'+
          DRIVERS.map(function(x,i){return '<li><button type="button" data-driver="'+i+'" aria-pressed="'+(i===st.driver)+'" style="--w:'+Math.round(x.p/DRIVERS[0].p*100)+'%"><i></i><span>'+x.n+'</span><em>'+x.p+'%</em></button></li>'}).join('')+'</ul></div>'+
          '<div class="a-card a-ai"><span class="a-tag">✦ AI insight</span><p>'+d.d+'</p><p><b>Suggested fix:</b> '+d.a+'</p>'+(d.go?'<button type="button" class="a-btn" data-mod-go="'+d.go[0]+'">'+d.go[1]+' →</button>':'')+'</div></div>'+
          '<div class="a-card"><b class="a-ct">Customer journey · last 30 days</b><ol class="a-funnel">'+
          FUNNEL.map(function(f,i){return '<li style="--w:'+Math.max(8,Math.round(f[1]/FUNNEL[0][1]*100))+'%"><span>'+f[0]+'</span><b>'+f[1].toLocaleString('en-US')+'</b>'+(i?'<em>'+Math.round(f[1]/FUNNEL[i-1][1]*100)+'% of the step before</em>':'')+'</li>'}).join('')+'</ol></div>';
      },
      promos:function(){
        var lift=PROMOS.reduce(function(t,p,i){return t+(st.promo[i]?p.lift:0)},0);
        return head('Smart Promotions','Targeted offers, switched on in one tap.')+
          '<div class="a-kpis a-two"><div class="a-card a-kpi"><small>Running now</small><b>'+count(st.promo)+' of '+PROMOS.length+'</b></div><div class="a-card a-kpi"><small>Projected lift / week</small><b>+'+money(lift)+'</b></div></div>'+
          '<ul class="a-list">'+PROMOS.map(function(p,i){return '<li class="a-card a-row"><div><b>'+p.n+'</b><small>'+p.s+' · est. +'+money(p.lift)+'/wk</small></div>'+sw(st.promo[i],'data-promo="'+i+'"',p.n)+'</li>'}).join('')+'</ul>';
      },
      loyalty:function(){
        var full=st.stamps>=10,stamps='';
        for(var i=0;i<10;i++)stamps+='<i class="'+(i<st.stamps?'on':'')+'"></i>';
        return head('Loyalty &amp; Rewards','Know your regulars, and notice when they drift.')+
          '<div class="a-kpis a-three"><div class="a-card a-kpi"><small>Members</small><b>642</b></div><div class="a-card a-kpi"><small>Visits this month</small><b>1,930</b></div><div class="a-card a-kpi"><small>Rewards redeemed</small><b>'+(87+st.redeemed)+'</b></div></div>'+
          '<div class="a-grid2"><div class="a-card"><b class="a-ct">Stamp card · Maya R.</b><div class="a-stamps" aria-label="'+st.stamps+' of 10 stamps">'+stamps+'</div><p class="a-muted">'+(full?'Free drink unlocked 🎉':(10-st.stamps)+' more for a free drink')+'</p><button type="button" class="a-btn" data-stamp="1">'+(full?'Redeem reward':'Add a stamp')+'</button></div>'+
          '<div class="a-card"><b class="a-ct">Regulars at risk</b><ul class="a-people">'+AT_RISK.map(function(x,i){var sent=st.sent.indexOf(i)>=0;
            return '<li><span class="a-av">'+x[0].charAt(0)+'</span><div><b>'+x[0]+'</b><small>'+x[1]+'</small></div><button type="button" class="a-btn a-sm" data-send="'+i+'"'+(sent?' disabled':'')+'>'+(sent?'Sent ✓':'Send reward')+'</button></li>'}).join('')+'</ul></div></div>';
      },
      menu:function(){
        return head('Menu Management','What sells, what earns, and what to change.')+
          '<div class="a-card a-ai"><span class="a-tag">✦ AI tip</span><p>Matcha Latte is up 24% this week, so feature it in a promotion. Avocado Toast has the lowest margin (34%) and is down 11%, so review its price.</p></div>'+
          '<div class="a-card a-tbl"><div class="a-tr a-th"><span>Item</span><span class="c2">Sold</span><span class="c3">Margin</span><span>Trend</span><span>On menu</span></div>'+
          MENU.map(function(m,i){return '<div class="a-tr'+(st.menu[i]?'':' off')+'"><span>'+m[0]+'</span><span class="c2">'+m[1]+'</span><span class="c3">'+m[2]+'%</span><span class="'+(m[3]>=0?'a-up':'a-down')+'">'+(m[3]>=0?'▲ ':'▼ ')+Math.abs(m[3])+'%</span><span>'+sw(st.menu[i],'data-item="'+i+'"',m[0]+' on menu')+'</span></div>'}).join('')+'</div>';
      },
      replies:function(){
        var r=REVIEWS[st.rev],done=st.replied.indexOf(st.rev)>=0,first=r.who.split(' ')[0];
        var draft=OPEN[st.tone][st.v].replace('{n}',first)+' '+r.body+CLOSE[st.tone];
        return head('AI-generated response','On-brand replies, drafted in seconds.')+
          '<div class="a-grid2"><ul class="a-list">'+REVIEWS.map(function(x,i){var d=st.replied.indexOf(i)>=0;
            return '<li><button type="button" class="a-card a-review'+(i===st.rev?' on':'')+'" data-rev="'+i+'"><span class="a-stars" aria-label="'+x.st+' out of 5 stars">'+'★★★★★'.slice(0,x.st)+'<s>'+'★★★★★'.slice(x.st)+'</s></span><b>'+x.who+' · '+x.src+'</b><small>'+x.t+'</small><em class="'+(d?'ok':'')+'">'+(d?'Replied':'Needs a reply')+'</em></button></li>'}).join('')+'</ul>'+
          '<div class="a-card"><b class="a-ct">Reply to '+first+'</b><div class="a-chips" role="group" aria-label="Tone">'+['warm','professional','short'].map(function(t){return '<button type="button" data-tone="'+t+'" aria-pressed="'+(st.tone===t)+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('')+'</div>'+
          '<textarea aria-label="Draft reply" rows="6">'+draft+'</textarea><div class="a-acts"><button type="button" class="a-btn a-ghost" data-regen="1">↻ Regenerate</button><button type="button" class="a-btn" data-post="1"'+(done?' disabled':'')+'>'+(done?'Posted ✓':'Post reply')+'</button></div></div></div>';
      }
    };
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
      else if(d.send){st.sent.push(+d.send);say('Reward sent to '+AT_RISK[+d.send][0])}
      else if(d.item){var j=+d.item;st.menu[j]=!st.menu[j];say(MENU[j][0]+(st.menu[j]?' is back on the menu':' marked sold out'))}
      else if(d.rev){st.rev=+d.rev;st.v=0}
      else if(d.tone){st.tone=d.tone;st.v=0}
      else if(d.regen){st.v=(st.v+1)%2}
      else if(d.post){st.replied.push(st.rev);say('Reply posted to '+REVIEWS[st.rev].src)}
      else return;
      render();
      if(had&&key){var nb=host.querySelector('[data-'+key.replace(/[A-Z]/g,function(c){return '-'+c.toLowerCase()})+'="'+d[key]+'"]');if(nb)nb.focus({preventScroll:true})}
    });
    render();
    return function(mod){
      if(mod)st.mod=mod;render();
      sc.scrollTo({top:host.offsetTop-ss.querySelector('.ss-bar').offsetHeight+1,behavior:'smooth'});
    };
  }

  /* ---- Prototype shell: theme switch, menu, modules, CTAs ---- */
  document.querySelectorAll('.ss').forEach(function(ss){
    var sc=ss.querySelector('.ss-scroll'),tog=ss.querySelector('.ss-tog'),lbl=ss.querySelector('.ss-toglbl'),
        menu=ss.querySelector('.ss-menu'),drop=ss.querySelector('.ss-drop'),toast=ss.querySelector('.ss-toast'),t;
    function say(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(t);t=setTimeout(function(){toast.classList.remove('show')},2400)}
    var openApp=initApp(ss,sc,say);
    ss.seroOpen=openApp;
    function go(name){
      if(name==='app'){openApp();return}
      var sec=ss.querySelector('[data-sec="'+name+'"]');if(!sec)return;
      sc.scrollTo({top:name==='hero'?0:sec.offsetTop-ss.querySelector('.ss-bar').offsetHeight+1,behavior:'smooth'});
    }
    function setDrop(o){drop.hidden=!o;menu.setAttribute('aria-expanded',o?'true':'false');menu.textContent=o?'Close':'Menu'}
    tog.addEventListener('click',function(){
      var light=ss.getAttribute('data-mode')!=='light';
      if(light)ss.setAttribute('data-mode','light');else ss.removeAttribute('data-mode');
      tog.setAttribute('aria-checked',light?'false':'true');
      lbl.textContent=light?'Dark Mode':'Light Mode';
    });
    menu.addEventListener('click',function(e){e.stopPropagation();setDrop(drop.hidden)});
    ss.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){setDrop(false);go(b.dataset.go)})});
    ss.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){openApp(b.dataset.open)})});
    ss.querySelectorAll('.ss-cta,.ss-demo').forEach(function(b){b.addEventListener('click',function(){setDrop(false);say('Demo request sent ☕ (prototype)')})});
    ss.querySelectorAll('.ss-mod>button').forEach(function(b){b.addEventListener('click',function(){
      b.setAttribute('aria-expanded',b.getAttribute('aria-expanded')==='true'?'false':'true');
    })});
    ss.addEventListener('click',function(e){if(!drop.hidden&&!drop.contains(e.target)&&e.target!==menu)setDrop(false)});
    ss.addEventListener('keydown',function(e){if(e.key==='Escape'&&!drop.hidden){setDrop(false);menu.focus()}});
  });

  /* ---- Modules tab: "Try it" opens that module in the prototype ---- */
  document.querySelectorAll('.mod-try').forEach(function(b){b.addEventListener('click',function(){
    document.getElementById('tsero2').click();
    var ss=document.getElementById(window.innerWidth>=760?'ssDesk':'ssPhone');
    setTimeout(function(){ss.scrollIntoView({behavior:'smooth',block:'center'});ss.seroOpen(b.dataset.try)},60);
  })});
})();
