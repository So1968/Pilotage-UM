// Correctif public Pilotage UM : referents metiers.
(function(){
  const EXTRA='pilotage-um-referents-metiers-v1';
  const STORAGE='reperes-um-2-cadre-v3-charge-attribution';
  const fields=[
    ['medecinReferentCode','Medecin referent',['MED','MEDECIN','DR']],
    ['neuropsyReferentCode','Neuropsy referent',['NEURO']],
    ['psychomotricienReferentCode','Psychomotricien referent',['PSYMO','PSYCHOMOT']],
    ['ergotherapeuteReferentCode','Ergotherapeute referent',['ERGO']],
    ['pairAidantReferentCode','Pair-aidant referent',['PAIR','AIDANT']]
  ];
  const metiers=['MEDECIN','IDE','EDUC','NEUROPSY','PSYCHOMOT','ERGO','PAIR-AIDANT','AUTRE'];
  function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function code(){const i=document.querySelector('.codeLigne input');const n=String(i&&i.value||'').replace(/\D/g,'');return n?'UM-2026-'+n.padStart(3,'0'):''}
  function rename(){document.querySelectorAll('label.champ span').forEach(s=>{const t=(s.textContent||'').trim();if(t==='Referente codee'||t==='Référente codée')s.textContent='Referente coordinatrice';if(t==='Binome code'||t==='Binôme codé')s.textContent='Educateur referent'})}
  function addMetiers(){document.querySelectorAll('select').forEach(sel=>{const txt=[...sel.options].map(o=>o.textContent).join('|').toUpperCase();if(!(txt.includes('IDE')&&txt.includes('EDUC')&&txt.includes('AUTRE')))return;metiers.forEach(m=>{if(![...sel.options].some(o=>o.value===m||o.textContent===m)){const op=document.createElement('option');op.value=m;op.textContent=m;sel.appendChild(op)}})})}
  function baseOptions(){const selects=[...document.querySelectorAll('label.champ select')];const base=selects.find(s=>[...s.options].some(o=>/IDE|EDU|NEURO|PSYMO|MED|ERGO|PAIR/i.test(o.textContent||'')));if(!base)return[];return[...base.options].filter(o=>o.value).map(o=>({v:o.value,l:o.textContent||o.value}))}
  function ok(opt,hints){const t=(opt.v+' '+opt.l).toUpperCase();return hints.some(h=>t.includes(h))}
  function save(){const c=code();if(!c)return;const all=read(EXTRA,{});all[c]=all[c]||{};document.querySelectorAll('select[data-ref-field]').forEach(s=>all[c][s.dataset.refField]=s.value||'');write(EXTRA,all)}
  function inject(){if(document.querySelector('.referentsMetiersAjoutes'))return;const spans=[...document.querySelectorAll('label.champ span')];const edu=spans.find(s=>(s.textContent||'').trim()==='Educateur referent');const lab=edu&&edu.closest('label.champ');if(!lab)return;const opts=baseOptions();if(!opts.length)return;const vals=(read(EXTRA,{})[code()]||{});const box=document.createElement('div');box.className='referentsMetiersAjoutes';box.innerHTML='<h4>Referents par fonction</h4><p>A renseigner si la situation mobilise ces fonctions. Donnees codees uniquement.</p>';fields.forEach(f=>{const label=document.createElement('label');label.className='champ champReferentMetier';const span=document.createElement('span');span.textContent=f[1];const sel=document.createElement('select');sel.dataset.refField=f[0];const empty=document.createElement('option');empty.value='';empty.textContent='Aucun / a definir';sel.appendChild(empty);let list=opts.filter(o=>ok(o,f[2]));if(!list.length)list=opts;list.forEach(o=>{const op=document.createElement('option');op.value=o.v;op.textContent=o.l;sel.appendChild(op)});sel.value=vals[f[0]]||'';sel.addEventListener('change',save);label.appendChild(span);label.appendChild(sel);box.appendChild(label)});lab.insertAdjacentElement('afterend',box)}
  function cards(){const data=read(STORAGE,[]);const extra=read(EXTRA,{});document.querySelectorAll('.carteSituationRepliee').forEach(card=>{const c=card.querySelector('.resumeSituationPrincipal strong')?.textContent?.trim();const zone=card.querySelector('.resumeSituationInfos');if(!c||!zone||zone.dataset.refs==='1')return;const v=extra[c]||{};fields.forEach(f=>{if(v[f[0]]){const sp=document.createElement('span');sp.className='infoReferentMetier';sp.textContent=f[1].replace(' referent','')+' '+v[f[0]];zone.appendChild(sp)}});zone.dataset.refs='1'})}
  function submit(){document.querySelectorAll('form.formulaire').forEach(f=>{if(f.dataset.refs==='1')return;f.dataset.refs='1';f.addEventListener('submit',()=>setTimeout(()=>{save();cards()},100),true)})}
  function run(){rename();addMetiers();inject();submit();cards()}
  new MutationObserver(()=>requestAnimationFrame(run)).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(run,300);window.addEventListener('load',run);
})();
