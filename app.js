const API = 'https://speedrun-talent-network.com/api/v1/jobs?fn=engineering&spec=fullstack,llm_application_agents&scope=speedrun&source=shrey-first-move';
const $ = id => document.getElementById(id);
const fields = ['candidate','project-name','project-url','contribution','decision','relevance','question'];
const projects = {
  'first-move': {
    name: 'First Move', url: location.origin + location.pathname,
    contribution: 'Built this working concept: public role lookup, an editable work sample, and an introduction preview that updates as you write.',
    decision: 'Kept project text in the browser and assembled the draft from explicit inputs. A candidate should be able to inspect every claim before sharing it.',
    relevance: 'The product engineer role calls for taking an idea through design and deployment. This is my proposal for improving the step between finding a role and asking for an intro.'
  },
  aegis: {
    name: 'Aegis Desk', url: 'https://github.com/Shreyp087/aegis-desk',
    contribution: 'Co-built a Next.js and TypeScript email-investigation prototype combining research, supporting evidence, and reply drafts in a human-review workflow.',
    decision: 'The team kept supporting evidence and uncertain assessments visible so a person could inspect a recommendation before acting.',
    relevance: 'I like building workflows that help someone make a clear next decision. I would bring that approach to the candidate and founder experience.'
  },
  game: {
    name: 'Chain Reaction', url: 'https://nexus-chain-reaction-game.netlify.app/',
    contribution: 'Built a game for my friends to play locally and online.',
    decision: 'Started with a game my friends wanted to play and made it available through a live link.',
    relevance: 'I enjoy taking an idea far enough that someone can actually use it. I would bring the same ownership to tools for job seekers and founders.'
  },
  custom: {name:'',url:'',contribution:'',decision:'',relevance:''}
};
const state = {jobs:[], selected:null, source:'loading', search:'', remote:false};
const validUrl = value => {try {const u=new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null;} catch {return null;}};
function syncQuery() {
  const u=new URL(location.href);
  if(state.search) u.searchParams.set('q',state.search); else u.searchParams.delete('q');
  if(state.remote) u.searchParams.set('remote','1'); else u.searchParams.delete('remote');
  if(state.selected) u.searchParams.set('role',state.selected.id); else u.searchParams.delete('role');
  history.replaceState(null,'',u);
}
function fromQuery(){const u=new URL(location.href);state.search=u.searchParams.get('q')||'';state.remote=u.searchParams.get('remote')==='1';$('role-search').value=state.search;$('remote-only').checked=state.remote;return u.searchParams.get('role');}
function fillProject(key) {
  const p=projects[key];
  $('project-name').value=p.name;$('project-url').value=p.url;$('contribution').value=p.contribution;$('decision').value=p.decision;$('relevance').value=p.relevance;
  fields.forEach(id=>$(id).removeAttribute('aria-invalid'));
  $('relevance-help').textContent='Keep this specific to the selected role.';
  $('copy-status').textContent='Review the wording before you share it.';renderPreview();
}
function setText(id,value,fallback='Add this in the editor.'){ $(id).textContent=value.trim()||fallback; }
function renderPreview() {
  const j=state.selected;
  setText('preview-name',$('candidate').value,'Your name');
  $('preview-recipient').textContent=j ? `For the ${j.company} hiring team` : 'Choose a role to begin';
  $('preview-role').textContent=j ? j.title : 'No role selected';
  setText('preview-project',$('project-name').value,'Your project');
  const link=validUrl($('project-url').value);if(link){$('preview-project').href=link;}else{$('preview-project').removeAttribute('href');}
  for(const key of ['contribution','decision','relevance','question'])setText('preview-'+key,$(key).value,key==='question'?'No question added.':'Add this in the editor.');
  const source=j&&validUrl(j.url);if(source){$('role-source').href=source;}else{$('role-source').removeAttribute('href');}
}
function renderJobs() {
  const q=state.search.toLowerCase();
  const jobs=state.jobs.filter(j=>(!q||`${j.title} ${j.company}`.toLowerCase().includes(q))&&(!state.remote||j.remote===true||String(j.workplace_type).toLowerCase()==='remote'));
  const root=$('role-list'); root.replaceChildren();root.setAttribute('aria-busy','false');
  $('role-count').textContent=`${jobs.length} shown`;
  if(!jobs.length){const p=document.createElement('p');p.className='empty-row';p.textContent='No roles in this loaded set match. Clear a filter or browse the full board.';root.append(p);return;}
  for(const j of jobs){
    const b=document.createElement('button');b.type='button';b.className='role-option';b.setAttribute('aria-pressed',String(state.selected?.id===j.id));
    const title=document.createElement('strong');title.textContent=j.title;
    const company=document.createElement('span');company.className='role-company';company.textContent=j.company;
    const meta=document.createElement('span');meta.className='role-meta';
    for(const val of [j.location||'Location to confirm',j.employment_type==='FullTime'?'Full time':j.employment_type||'Terms to confirm']) {const s=document.createElement('span');s.textContent=val;meta.append(s);}
    b.append(title,company,meta);b.addEventListener('click',()=>{const changed=state.selected?.id!==j.id;state.selected=j;if(changed)$('relevance-help').textContent=`Role changed to ${j.title} at ${j.company}. Review your explanation before copying.`;syncQuery();renderJobs();renderPreview();});root.append(b);
  }
}
async function getJson(url,signal){const r=await fetch(url,{signal,credentials:'omit'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}
async function loadJobs() {
  const wanted=fromQuery()||state.selected?.id;
  $('refresh').disabled=true;$('refresh').setAttribute('aria-busy','true');$('role-list').setAttribute('aria-busy','true');
  $('data-status').textContent='Loading roles from Speedrun…';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
  try {
    const d=await getJson(API,controller.signal);if(!Array.isArray(d.jobs))throw new Error('Unexpected API response');
    state.jobs=d.jobs.filter(j=>j&&j.id&&j.title&&j.company&&validUrl(j.url));state.source='live';
    $('data-status').textContent=`Live API results. ${state.jobs.length} roles loaded; filters apply to this set.`;
  } catch {
    try {const d=await getJson('./jobs-snapshot.json');state.jobs=d.jobs;state.source='snapshot';$('data-status').textContent=`Live roles unavailable. Showing a Nov 6, 2026 snapshot. Check the original role before applying.`;}
    catch {state.jobs=[];state.source='error';$('data-status').textContent='Roles could not load. Try Refresh or open the complete board.';}
  } finally {clearTimeout(timer);$('refresh').disabled=false;$('refresh').removeAttribute('aria-busy');}
  state.selected=state.jobs.find(j=>j.id===wanted)||state.jobs.find(j=>j.company.toLowerCase()==='speedrun')||state.jobs[0]||null;
  renderJobs();renderPreview();
}
function introText(){const j=state.selected;return `Hi ${j.company} team,\n\nI'm ${$('candidate').value.trim()}, and I'm interested in your ${j.title} role.\n\nRelevant work: ${$('project-name').value.trim()}\n${$('project-url').value.trim()}\n${$('contribution').value.trim()}\n\nA decision behind it: ${$('decision').value.trim()}\n\nWhy I'd like to talk: ${$('relevance').value.trim()}\n\nTo discuss: ${$('question').value.trim()||'Happy to discuss the role.'}\n\nRole: ${j.url}`;}
$('proof-form').addEventListener('submit',e=>e.preventDefault());
for(const id of fields)$(id).addEventListener('input',()=>{$(id).removeAttribute('aria-invalid');if(id==='relevance')$('relevance-help').textContent='Keep this specific to the selected role.';$('copy-status').textContent='Review the wording before you share it.';renderPreview();});
$('project').addEventListener('change',()=>fillProject($('project').value));
$('role-search').addEventListener('input',()=>{state.search=$('role-search').value;syncQuery();renderJobs();});
$('remote-only').addEventListener('change',()=>{state.remote=$('remote-only').checked;syncQuery();renderJobs();});
$('refresh').addEventListener('click',loadJobs);
$('reset').addEventListener('click',()=>{$('candidate').value='Shrey Patel';$('project').value='first-move';$('question').value='Location, weekly hours, and contract duration.';fillProject('first-move');});
$('copy').addEventListener('click',async()=>{
  if(!state.selected){$('copy-status').textContent='Choose a role first.';return;}
  for(const id of fields.filter(x=>x!=='question')) {const el=$(id);const ok=el.value.trim()&&(id!=='project-url'||validUrl(el.value));if(ok)el.removeAttribute('aria-invalid');else el.setAttribute('aria-invalid','true');if(!ok){$('copy-status').textContent=id==='project-url'?'Use a complete http or https project link.':'Add the missing project details before copying.';el.focus();return;}}
  const b=$('copy');b.disabled=true;b.setAttribute('aria-busy','true');
  try {await navigator.clipboard.writeText(introText());$('copy-status').textContent='Copied to your clipboard. Nothing was sent.';}
  catch {$('copy-status').textContent='Clipboard is unavailable. Select the preview text and copy it manually.';}
  finally {b.disabled=false;b.removeAttribute('aria-busy');}
});
window.addEventListener('popstate',()=>{const id=fromQuery();if(id)state.selected=state.jobs.find(j=>j.id===id)||state.selected;renderJobs();renderPreview();});
fillProject('first-move');loadJobs();
