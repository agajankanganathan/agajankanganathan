/* Sero site content and dashboard sample data.
   Module copy and sample data come from the Sero case study prototype. */
window.SERO = {
  modules: [
    {id:'insights', n:'AI Customer Insights', short:'See why customers leave, from reviews, visits and feedback, in one place.',
     problem:'Most cafés only find out why a customer stopped coming when they read a bad review, if they find out at all.',
     does:'Reads reviews, visit patterns and feedback together, then ranks the reasons guests don’t come back and suggests a fix for each.'},
    {id:'promos', n:'Smart Promotions', short:'Offers aimed at the guests you’re most at risk of losing.',
     problem:'Blanket discounts give money away to people who would have come in anyway.',
     does:'Suggests targeted offers for specific groups, like guests who haven’t visited in 30 days, or triggers like a rainy morning.'},
    {id:'loyalty', n:'Loyalty & Rewards', short:'Reward regulars and bring lapsed customers back.',
     problem:'Paper stamp cards can’t tell you who your regulars are, or when they stop coming.',
     does:'A digital stamp card and member list that flags regulars who are drifting away, so you can win them back early.'},
    {id:'menu', n:'Menu Management', short:'Spot which items earn repeat visits and which don’t.',
     problem:'On a till report, best-sellers and money-losers look the same.',
     does:'Tracks every item’s sales, margin and trend, and lets staff mark items sold out in seconds.'},
    {id:'replies', n:'AI-generated response', short:'Draft on-brand replies to reviews in seconds.',
     problem:'Replying to every review takes time owners don’t have, so most go unanswered.',
     does:'Drafts an on-brand reply to each review in the tone you choose, ready to edit and post.'},
    {id:'analytics', n:'Analytics Dashboard', short:'Revenue risk and growth, tracked in one view.',
     problem:'Sales, reviews and loyalty data live in different apps that don’t talk to each other.',
     does:'Brings every module into one home screen: revenue, customers, return rate and revenue at risk.'}
  ],

  nav: [['analytics','Analytics','<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>'],
    ['insights','Insights','<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'],
    ['promos','Promotions','<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>'],
    ['loyalty','Loyalty','<path d="M12 20s-7.5-4.8-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.2 12 20 12 20z"/>'],
    ['menu','Menu','<path d="M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>'],
    ['replies','Responses','<path d="M4 5h16v11H9l-5 4z"/>']],

  range: {
    '7d':{bars:[980,1120,1040,1260,1390,1610,1020],lab:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      k:[['Revenue','$8,420','+6% vs last week'],['Customers','1,284','+4%'],['Return rate','38%','+3 pts'],['Revenue at risk','$1,150','−9%']]},
    '30d':{bars:[6900,7400,7850,8420],lab:['Wk 1','Wk 2','Wk 3','Wk 4'],
      k:[['Revenue','$30,570','+11% vs last month'],['Customers','4,960','+7%'],['Return rate','36%','+5 pts'],['Revenue at risk','$4,380','−14%']]}
  },

  drivers: [
    {n:'Long waits at morning peak',p:34,d:'Orders placed between 8 and 10am wait over 6 minutes on average. Guests who wait that long are 18% less likely to come back.',a:'Add a second barista from 8 to 10am.'},
    {n:'Price vs. portion',p:22,d:'“Small for the price” came up 41 times in reviews this month, mostly about sandwiches.',a:'Bundle a sandwich with a drink at a small discount.',go:['promos','Set up a bundle offer']},
    {n:'No seats at lunch',p:18,d:'Lunch visits drop on days the café is more than 85% full.',a:'Push takeaway at lunch with a pre-order offer.',go:['promos','See lunch offers']},
    {n:'Same menu every visit',p:14,d:'Three items make up 52% of repeat orders. Regulars say they “always get the same thing”.',a:'Rotate a weekly special.',go:['menu','Open the menu']},
    {n:'Rushed welcome',p:12,d:'Mostly positive, but 9 reviews mention a rushed hello at busy times.',a:'Share a quick greeting routine with the morning team.'}
  ],

  funnel: [['Discovered you',3200],['First visit',1284],['Came back within 30 days',488],['Became a regular',211]],

  promos: [
    {n:'Win-back: 20% off',s:'212 guests away for 30+ days',lift:640,on:true},
    {n:'Rainy-day latte + pastry',s:'Runs when rain is forecast',lift:310,on:true},
    {n:'2-for-1 pastries, 2–4pm',s:'Everyone, weekdays',lift:420,on:false},
    {n:'Sandwich + drink bundle',s:'Lunch, 11am–2pm',lift:380,on:false},
    {n:'Birthday drink on us',s:'38 members this month',lift:190,on:true}
  ],

  atRisk: [['Maya R.','Daily regular · last visit 24 days ago'],['Jordan T.','Weekly · last visit 19 days ago'],['Priya S.','Regular · last visit 31 days ago'],['Sam K.','Weekly · last visit 22 days ago']],

  /* name, sold, margin %, trend %, on menu */
  menu: [['Oat Latte',412,72,8,true],['Cold Brew',268,78,-3,true],['Matcha Latte',194,69,24,true],['Almond Croissant',231,58,5,true],['Avocado Toast',122,34,-11,true],['Banana Bread',96,64,2,false]],

  reviews: [
    {who:'Marcus D.',src:'Google',st:2,t:'Waited almost 10 minutes for a cold brew on a weekday morning. Coffee was good but I was late for work.',
     body:'We’re sorry about the wait. Mornings have been busy, so we’re adding a second barista from 8 to 10am to keep the line moving.'},
    {who:'Aisha K.',src:'Instagram',st:4,t:'Lovely space and great coffee, but the sandwiches feel small for the price.',
     body:'Thank you for the honest feedback on our sandwiches. We’re trying a sandwich and drink bundle so lunch feels like better value.'},
    {who:'Hannah L.',src:'Google',st:5,t:'Best oat latte in the neighbourhood, and the staff remembered my name!',
     body:'We’re so happy the oat latte hit the spot, and the team loved reading that they made you feel at home.'}
  ],
  open: {warm:['Hi {n}, thank you for taking the time to write.','Hey {n}, thanks so much for visiting.'],
    professional:['Dear {n}, thank you for your review.','Hello {n}, we appreciate your feedback.'],
    short:['Thanks, {n}!','Hi {n},']},
  close: {warm:' Hope to see you again soon.',professional:' We look forward to welcoming you back.',short:' – The team'}
};
