(() => {
  const $ = selector => document.querySelector(selector);
  const stations = [...document.querySelectorAll('.station')];
  const chat = $('#team-chat'), monitors = $('#agent-monitors');
  const pause = $('#demo-pause'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const team = [
    {name:'Alex',role:'Android engineer',color:'#FC4C13',hair:'#49352b',skin:'#e6b18c',task:'Player movement & game loop',file:'GameScreen.kt',code:'@Composable\nfun GameScreen() {\n  val player = remember { Player() }\n  Canvas(Modifier.fillMaxSize()) {\n    drawPlayer(player.position)\n  }\n}'},
    {name:'Maya',role:'Game designer',color:'#596d64',hair:'#292128',skin:'#b77e5b',task:'Levels, obstacles & visual rhythm',file:'level-design.md',code:'# Orbit Runner / Level 01\nTheme: orbital station\nControls: tap to jump\nGoal: collect energy cells\nDifficulty: easy → medium\nSafe zone: first 3 seconds'},
    {name:'Leo',role:'QA engineer',color:'#57718c',hair:'#71513b',skin:'#f0c6a1',task:'Collision tests & device checks',file:'RunnerPhysicsTest.kt',code:'@Test\nfun jumpClearsSmallObstacle() {\n  val runner = Runner()\n  runner.jump()\n  advanceFrames(12)\n  assertTrue(runner.isAirborne)\n}'},
    {name:'Nova',role:'Project lead',color:'#8b6a80',hair:'#272b30',skin:'#ce9874',task:'Sprint planning & release review',file:'sprint-board.md',code:'# Sprint 01 / Orbit Runner\n[ ] Confirm core game loop\n[ ] Build first playable level\n[ ] Test on Android devices\n[ ] Review the debug build\n\nTarget: a small playable prototype'},
  ];
  // A scripted sequence: no API requests and no pretend live model connection.
  const script = [
    [3,"Team, let's build Orbit Runner — a one-tap Android game.",'Sprint goal agreed',8],
    [1,"I'll sketch the first level. Energy cells, low gravity, clean shapes.",'Designing the first level',16],
    [0,"Starting the Kotlin game loop. Tap to jump, collect, repeat.",'Building the core loop',25],
    [2,"I'll cover collisions and check the layout on small phones.",'Writing the test plan',33],
    [1,"Alex, the jump should feel lighter. Can we add a little air time?",'Tuning the player feel',42],
    [0,"Absolutely. Coyote time is in — the controls feel much better.",'Refining jump physics',50],
    [3,"Nice progress. Maya, grab a coffee; I'll review the level notes.",'Reviewing the level design',58],
    [2,"Found a collision issue at high speed. Sending a repro to Alex.",'Testing the prototype',66],
    [0,"Fixed the hitbox timing. Ready for another test run, Leo.",'Fixing a physics edge case',75],
    [1,"Back with coffee. Added a clearer landing zone and a checkpoint.",'Polishing the first level',83],
    [2,"Retest passed. Jump, restart, and background/resume look good.",'Completing the QA checklist',92],
    [3,"Prototype ready! Let's package the debug build and plan the next sprint.",'Prototype review complete',100],
  ];
  let index = 0, sprint = 1, selected = 3, timer = 0, paused = reduced.matches;
  let disposed = false, speechTicks = 0, walking = null;
  team.forEach((agent, i) => {
    const station = stations[i];
    station.classList.remove('idle-desk');station.classList.add('working');
    station.style.setProperty('--accent',agent.color);station.style.setProperty('--hair',agent.hair);station.style.setProperty('--skin',agent.skin);
    station.setAttribute('role','button');station.tabIndex=0;station.setAttribute('aria-label',`${agent.name}, ${agent.role}: view task`);
    const plate=station.querySelector('.nameplate');plate.replaceChildren();
    plate.append(document.createElement('i'),document.createTextNode(agent.name+' / AI'));
    station.querySelector('.role').textContent=agent.role;
    const person=document.createElement('div');person.className='person';person.setAttribute('aria-hidden','true');
    const hands=document.createElement('span');hands.className='typing-hands';
    const badge=document.createElement('span');badge.className='agent-badge';badge.textContent='AI';person.append(hands,badge);
    station.querySelector('.desk').append(person);
    const speech=document.createElement('div');speech.className='speech';speech.setAttribute('aria-hidden','true');station.append(speech);
    const window=document.createElement('article');window.className='work-window';
    window.innerHTML='<div class="work-title"><div class="work-identity"><span class="work-dot"></span><div><button type="button"></button><small></small></div></div><span class="work-state">Working</span></div><div class="work-stage"></div><div class="work-progress"><progress max="100" value="0"></progress><span>0%</span></div><pre class="work-output"></pre><div class="work-footer"></div>';
    window.querySelector('button').textContent=agent.name+' / '+agent.role;
    window.querySelector('small').textContent=agent.file;
    window.querySelector('.work-stage').textContent=agent.task;
    window.querySelector('progress').setAttribute('aria-label',agent.name+' task progress');
    window.querySelector('pre').textContent=agent.code;
    window.querySelector('.work-footer').textContent='Waiting for the sprint kickoff';
    monitors.append(window);agent.window=window;agent.station=station;
    station.addEventListener('click',()=>select(i));
    station.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(i)}});
    window.querySelector('button').addEventListener('click',()=>select(i));
  });
  function select(i){
    selected=i;
    team.forEach((agent,j)=>{agent.station.classList.toggle('selected',j===i);agent.station.setAttribute('aria-pressed',String(j===i));agent.window.classList.toggle('selected',j===i)});
    $('.profile p').textContent=team[i].name+' · '+team[i].task;
  }
  function say(agent,text,system=false){
    const message=document.createElement('div');message.className='message'+(system?' system':'');
    message.style.setProperty('--agent-color',agent.color);
    const title=document.createElement('b'),time=document.createElement('time');
    title.textContent=agent.name+' / '+agent.role;time.textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});title.append(time);
    const body=document.createElement('span');body.textContent=text;message.append(title,body);chat.append(message);
    while(chat.children.length>9)chat.firstElementChild.remove();
    chat.scrollTop=chat.scrollHeight;
    team.forEach(a=>a.station.classList.remove('speaking'));
    agent.station.querySelector('.speech').textContent=text;agent.station.classList.add('speaking');speechTicks=2;
  }
  function coffee(i){
    if(reduced.matches)return;
    const agent=team[i],person=agent.station.querySelector('.person');
    const from=person.getBoundingClientRect(),to=$('.coffee-table').getBoundingClientRect();
    agent.station.style.setProperty('--walk-x',`${to.left+to.width*.3-from.left}px`);
    agent.station.style.setProperty('--walk-y',`${to.top-from.top-48}px`);
    agent.station.classList.add('walking');agent.station.querySelector('.role').textContent='Coffee break / reviewing ideas';walking=i;
  }
  function returnToDesk(){
    if(walking===null)return;
    const agent=team[walking];agent.station.classList.remove('walking');agent.station.querySelector('.role').textContent=agent.role;walking=null;
  }
  function step(){
    const [who,text,phase,progress]=script[index];
    if(index===0){
      team.forEach(agent=>{agent.window.querySelector('pre').textContent=agent.code.replace('Sprint 01','Sprint '+String(sprint).padStart(2,'0'))});
      $('#sprint-number').textContent='SPRINT '+String(sprint).padStart(2,'0');
    }
    say(team[who],text);
    $('#sprint-phase').textContent=phase;$('#sprint-percent').textContent=progress+'%';$('#sprint-progress').value=progress;
    team.forEach((agent,i)=>{
      const value=Math.min(100,Math.max(0,progress+(i===who?5:-(i*3))));
      agent.window.querySelector('progress').value=value;agent.window.querySelector('.work-progress span').textContent=value+'%';
      agent.window.querySelector('.work-state').textContent=progress===100?'Reviewed':i===who?'Updating':'Working';
    });
    const output=team[who].window.querySelector('pre');
    output.textContent+='\n\n// '+phase+'\n// '+text;
    const allLines=output.textContent.split('\n');if(allLines.length>28)output.textContent=allLines.slice(-28).join('\n');output.scrollTop=output.scrollHeight;
    team[who].window.querySelector('.work-footer').textContent=phase;
    if(index===6)coffee(1);if(index===8)returnToDesk();
    index=(index+1)%script.length;if(index===0)sprint++;
  }
  function updatePause(){
    document.body.classList.toggle('paused',paused||document.hidden);
    pause.textContent=paused?'Resume demo':'Pause demo';pause.setAttribute('aria-pressed',String(paused));
    $('.intro .tag').textContent=paused?'DEMO PAUSED':'DEMO RUNNING';
  }
  function schedule(){
    clearTimeout(timer);
    if(paused||document.hidden||disposed)return;
    timer=setTimeout(()=>{if(speechTicks>0&&--speechTicks===0)team.forEach(a=>a.station.classList.remove('speaking'));step();schedule()},4800);
  }
  pause.addEventListener('click',()=>{paused=!paused;updatePause();schedule()});
  reduced.addEventListener('change',()=>{if(reduced.matches){paused=true;returnToDesk()}updatePause();schedule()});
  document.addEventListener('visibilitychange',()=>{updatePause();schedule()});
  addEventListener('resize',returnToDesk);
  addEventListener('pagehide',()=>{disposed=true;clearTimeout(timer)});
  addEventListener('pageshow',event=>{if(event.persisted){disposed=false;schedule()}});
  select(selected);step();updatePause();schedule();
})();
