'use strict';
const TOOLS = {
 missing:{repo:'HandiMissingDataEstimaor',name:'Recover missing values',short:'Missing-data estimation',category:'DATA PREPARATION',description:'Give incomplete data a second look. Explore PCA-based reconstruction and compare estimates against values deliberately hidden from the model.',question:'Can the relationships between variables help recover measurements that are missing?',example:'example_usage.py',source:'PCAFill/pca_fill.py',fields:[['missing','Values to hide',[[10,'10%'],[20,'20%'],[25,'25%']],20,'A complete calibration block is retained.'],['seed','Example seed',[[42,'42 · default example'],[7,'7 · alternative'],[73,'73 · alternative']],42,'Same synthetic construction, a different sample.']],empty:'Compare hidden-value estimates with their known values and a simple mean-fill baseline.'},
 ordering:{repo:'SelectivePCA-Data-Reordering-Tool',name:'Find the information in your variables',short:'Variable ordering',category:'DATA UNDERSTANDING',description:'Explore which variables add information and which largely repeat what is already represented. Start with the exact dataset in the repository example.',question:'How much of this dataset can a smaller set of variables represent?',example:'example_usage.py',source:'spca/spca.py',fields:[['keep','Variables to retain',[[1,'1 variable'],[2,'2 variables'],[3,'3 variables'],[4,'4 variables'],[5,'All 5 variables']],3,'Changes the retained prefix of the source’s computed order.']],empty:'Inspect the variable ranking, incremental variance, and cumulative coverage.'},
 propensity:{repo:'AutoPropensity',name:'Understand how actions were assigned',short:'Propensity modeling',category:'DECISION EVALUATION',description:'Fit a propensity model and inspect the support for observed actions. Follow a bounded version of the repository’s tune → fit → score example.',question:'Were observed actions plausible given the state, or supported by very little historical evidence?',example:'usecase_basic.py',source:'auto_propensity/builder.py',fields:[['samples','Example observations',[[120,'120 observations'],[200,'200 observations'],[300,'300 observations']],120,'4 state variables; a separate 25% held-out test set.'],['action','Action space',[['discrete','Discrete · 3 actions'],['continuous','Continuous · 1 action']], 'discrete','Parametric search only; no neural networks or nonparametric search.']],empty:'See the distribution of held-out action scores and inspect the selected model configuration.'},
 pca:{repo:'pca_nipals',name:'Look inside multivariate data',short:'PCA exploration',category:'MULTIVARIATE MODELING',description:'Project several measurements into a smaller model space. Explore scores and the variation retained by your NIPALS PCA implementation.',question:'What changes when several input variables are represented using only a few components?',example:'example_usage.py',source:'pca_nipals/pca.py',fields:[['components','PCA components',[[1,'1 component'],[2,'2 components'],[3,'3 components']],2,'30 calibration observations, 4 inputs, 10 test observations.'],['seed','Example seed',[[42,'42 · default example'],[7,'7 · alternative'],[73,'73 · alternative']],42,'Reproducible synthetic observations.']],empty:'Explore score-space structure, retained variance, and held-out reconstruction error.'},
 pls:{repo:'pls_nipals',name:'Connect measurements to outcomes',short:'PLS prediction',category:'SUPERVISED MODELING',description:'Fit a NIPALS partial least squares model, then inspect its predictions on separate example observations.',question:'How well can a compact model connect input measurements with an output of interest?',example:'README.md',source:'pls_nipals/pls.py',fields:[['components','PLS components',[[1,'1 component'],[2,'2 components'],[3,'3 components']],2,'30 calibration observations, 4 inputs and 2 outputs.'],['seed','Example seed',[[42,'42 · default example'],[7,'7 · alternative'],[73,'73 · alternative']],42,'The README’s synthetic linear data construction.']],empty:'Compare predicted and known held-out outputs, then inspect prediction residuals.'},
 clusters:{repo:'KMeansPro',name:'Explore groups in a dataset',short:'Clustering',category:'PATTERN EXPLORATION',description:'Partition example observations using the repository’s K-means implementation. Explore the effect of cluster count and initialization repeats.',question:'How does the grouping of the same observations change when the clustering settings change?',example:'code_executor.py',source:'kmeansPro.py',fields:[['clusters','Requested clusters',[[2,'2 clusters'],[3,'3 clusters'],[4,'4 clusters']],3,'60 synthetic observations in 2 dimensions.'],['restarts','Initialization repeats',[[3,'3 repeats'],[5,'5 repeats'],[10,'10 repeats']],3,'Bounded repeat search using the original fitting routine.']],empty:'See cluster membership, group sizes, and the source routine’s distance-to-center objective.'},
 nullspace:{repo:'NullSpaceExplorer',name:'Find different inputs for the same target',short:'Null-space exploration',category:'MODEL INVERSION',description:'Explore alternative input combinations that retain a desired output in a fitted model. Make a mathematical relationship visible.',question:'Can different input settings lead to the same modeled outcome?',example:'example_usage.py',source:'nspls/null_space.py',fields:[['points','Alternatives to display',[[10,'Up to 10 alternatives'],[20,'Up to 20 alternatives'],[30,'Up to 30 alternatives']],20,'The source samples candidates internally; displayed results are capped.'],['seed','Example seed',[[42,'42 · default example'],[7,'7 · alternative'],[73,'73 · alternative']],42,'30 calibration observations, 4 inputs, 2 outputs.']],empty:'Inspect alternative input combinations and their deviations from the modeled target.'},
 clusterpls:{repo:'cluster-based-pls',name:'Explore local predictive relationships',short:'Cluster-based PLS',category:'CLUSTERED REGRESSION',description:'Combine input-space clustering with PLS models. Compare predictions against a single global model on the same synthetic test observations.',question:'What changes when observations are modeled in groups rather than with one global relationship?',example:'CB_pls_executer.py',source:'CB_PLS.py',fields:[['clusters','Requested input clusters',[[1,'1 · global model'],[2,'2 input clusters'],[3,'3 input clusters']],2,'60 calibration observations, 3 inputs and 3 outputs.'],['seed','Example seed',[[42,'42 · default example'],[7,'7 · alternative'],[73,'73 · alternative']],42,'3 initialization repeats; the source may reduce cluster count.']],empty:'Compare held-out predictions from clustered and single-model PLS. This is a code example, not a replay of the published microgel study.'}
};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const palette=['#2b7157','#ca8050','#7888b6','#b1ad57'];
let current='missing',last=null,controller=null,uploadFile=null,uploadInfo=null;
const UPLOAD_CAPS={missing:[60,6],ordering:[60,6],propensity:[120,5],pca:[80,6],pls:[80,8],clusters:[60,4],nullspace:[50,6],clusterpls:[80,6]};
const fmt=v=>typeof v==='number'?(v===0?'0':Math.abs(v)<.0001?v.toExponential(2):Number.isInteger(v)?String(v):v.toFixed(4)):v==null?'Unavailable':String(v);
function repoUrl(t){return 'https://github.com/Saeid-Tayebi/'+TOOLS[t].repo;}
function settings(){return Object.fromEntries(TOOLS[current].fields.map(([key,,options])=>{const val=$('input-'+key).value;return [key,typeof options[0][0]==='number'?Number(val):val];}));}
function selectTool(key){
 if(!TOOLS[key])key='missing';if(controller)controller.abort();current=key;last=null;resetUpload();
 document.querySelector('.back').href='./#tool-'+key;
 const t=TOOLS[key];document.title=t.short+' | Saeid Tayebi Interactive Lab';
 history.replaceState(null,'','?tool='+encodeURIComponent(key));
 document.querySelectorAll('#tool-nav button').forEach(b=>{const on=b.dataset.tool===key;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false');});
 for(const [id,value] of Object.entries({title:t.name,category:t.category,breadcrumb:t.short,description:t.description,question:t.question,'empty-description':t.empty}))$(id).textContent=value;
 $('repo-link').href=repoUrl(key);$('full-link').href=repoUrl(key);$('example-link').href=repoUrl(key)+'/blob/main/'+t.example;
 $('fields').innerHTML=t.fields.map(([key,label,options,def,hint])=>`<label class="field" for="input-${key}"><span class="field-label">${esc(label)}</span><select id="input-${key}" name="${key}" aria-describedby="hint-${key}">${options.map(([v,l])=>`<option value="${v}" ${v===def?'selected':''}>${esc(l)}</option>`).join('')}</select><small id="hint-${key}">${esc(hint)}</small></label>`).join('');
 $('fields').querySelectorAll('select').forEach(el=>el.addEventListener('change',()=>{if(last){$('run-state').textContent='Settings changed';$('notice').textContent='Settings changed. Run again to update the displayed results.';}}));
 $('empty').hidden=false;$('results').hidden=true;$('notice').textContent='';$('run-state').textContent='Ready to run';$('run').disabled=false;$('run').innerHTML=($('data-mode').value==='upload'?'Run on my data':'Run example')+' <span aria-hidden="true">↗</span>';
 $('snippet').textContent='Run an example to inspect the exact call.';$('implementation').hidden=true;$('source-toggle').setAttribute('aria-expanded','false');$('source-toggle').textContent='Read implementation';
}
function range(vals){let lo=Math.min(...vals),hi=Math.max(...vals);if(lo===hi){const pad=Math.max(Math.abs(lo)*.1,1e-15);lo-=pad;hi+=pad;}const pad=(hi-lo)*.09;return [lo-pad,hi+pad];}
function svgPlot(c){
 const W=matchMedia('(max-width:740px)').matches?360:520,H=285,L=60,R=18,T=15,B=65,w=W-L-R,h=H-T-B;
 let content='',legend='';
 const text=(x,y,s,anchor='middle',size=10)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="#728269">${esc(s)}</text>`;
 if(c.kind==='scatter'){
  const pairs=c.x.map((x,i)=>[x,c.y[i],c.groups?.[i]??0,i]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
  const [xmin,xmax]=range(pairs.map(p=>p[0])),[ymin,ymax]=range(pairs.map(p=>p[1]));
  const sx=x=>L+(x-xmin)/(xmax-xmin)*w,sy=y=>T+h-(y-ymin)/(ymax-ymin)*h;
  for(let i=0;i<=4;i++){const x=xmin+(xmax-xmin)*i/4,y=ymin+(ymax-ymin)*i/4;content+=`<path d="M${L} ${sy(y)}H${W-R}" stroke="#e8ede3"/>`+text(L-8,sy(y)+3,fmt(y),'end',9)+text(sx(x),H-B+20,fmt(x),'middle',9);}
  content+=pairs.map(([x,y,g,i])=>`<circle cx="${sx(x)}" cy="${sy(y)}" r="4" fill="${palette[g%palette.length]}" opacity=".82"><title>Observation ${i+1}: ${esc(c.xlabel)} = ${fmt(x)}; ${esc(c.ylabel)} = ${fmt(y)}${c.groups?'; group '+(g+1):''}</title></circle>`).join('');
  content+=text(L+w/2,H-16,c.xlabel)+`<text transform="translate(15 ${T+h/2}) rotate(-90)" text-anchor="middle" font-size="10" fill="#728269">${esc(c.ylabel)}</text>`;
  if(c.groups)legend=`<div class="legend">${[...new Set(c.groups)].sort().map(g=>`<span><i style="background:${palette[g%palette.length]}"></i>Group ${g+1}</span>`).join('')}</div>`;
 }else{
  const vals=c.values.map(v=>v??0),lo=Math.min(0,...vals),hi=Math.max(...vals,1)*1.12;const sy=y=>T+h-(y-lo)/(hi-lo)*h;const bw=w/vals.length;
  for(let i=0;i<=4;i++){let y=lo+(hi-lo)*i/4;content+=`<path d="M${L} ${sy(y)}H${W-R}" stroke="#e8ede3"/>`+text(L-7,sy(y)+3,fmt(y),'end',9);}
  content+=vals.map((v,i)=>`<rect x="${L+i*bw+bw*.18}" y="${Math.min(sy(v),sy(0))}" width="${bw*.64}" height="${Math.max(1,Math.abs(sy(0)-sy(v)))}" rx="2" fill="${(c.selected?i<c.selected:i===0)?'#2b7157':'#a7bd94'}"><title>${esc(c.labels[i])}: ${fmt(v)}</title></rect>`+text(L+(i+.5)*bw,H-B+18,c.labels[i],'middle',8)).join('');
  content+=`<text transform="translate(15 ${T+h/2}) rotate(-90)" text-anchor="middle" font-size="10" fill="#728269">${esc(c.ylabel)}</text>`;
 }
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}"><title>${esc(c.title)}</title>${content}</svg>${legend}<p class="plot-note">Hover over a point or bar for its value. Exact results are also available in the result table below.</p>`;
}
function heatmap(c){
 const vals=c.after.flat().filter(Number.isFinite),lo=Math.min(...vals),hi=Math.max(...vals);
 const grid=(data,label)=>`<div><h4>${label}</h4><div class="heat-grid" style="grid-template-columns:repeat(${data[0].length},1fr)">${data.map((row,i)=>row.map((v,j)=>{const a=v===null?.2:.2+.7*(v-lo)/(hi-lo||1);return `<div class="cell ${v===null?'missing':''}" style="background:rgba(36,104,76,${a})" title="Observation ${i+1}, variable ${j+1}: ${v===null?'hidden':fmt(v)}"></div>`;}).join('')).join('')}</div></div>`;
 return `<div class="heatmaps">${grid(c.before,'Before · coral cells are missing')}${grid(c.after,'After · returned by pca_fill()')}</div><p class="heat-label">Rows: ${c.before.length} observations · Columns: ${c.before[0].length} variables · Color intensity: value</p>`;
}
function render(data){
 last=data;$('empty').hidden=true;$('results').hidden=false;
 $('metrics').innerHTML=data.metrics.map(m=>`<div class="metric"><span>${esc(m.label)}</span><strong>${esc(fmt(m.value))}<small>${esc(m.unit)}</small></strong></div>`).join('');
 $('charts').innerHTML=data.charts.map(c=>`<article class="chart"><h3>${esc(c.title)}</h3>${c.kind==='heatmap'?heatmap(c):svgPlot(c)}</article>`).join('');
 $('insight').textContent=data.insight;$('dataset').textContent=data.dataset;$('snippet').textContent=data.snippet;
 $('result-settings').textContent=(data.uploaded?'YOUR DATA · ':'')+Object.entries(data.settings).map(([k,v])=>k+': '+v).join(' · ')+' · '+(data.cached?'cached run':data.seconds+' seconds');
 $('configuration').textContent=data.config?JSON.stringify(data.config,null,2):'';
 const tab=data.table;
 $('table').innerHTML=`<table><caption class="overline">Values returned by the example</caption><thead><tr>${tab.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${tab.rows.map(row=>`<tr>${row.map(v=>`<td>${esc(fmt(v))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 $('run-state').textContent='Completed';$('notice').textContent='';
}
$('tool-nav').innerHTML=Object.entries(TOOLS).map(([key,t],i)=>`<button type="button" data-tool="${key}"><span class="number">${String(i+1).padStart(2,'0')}</span><span class="nav-title">${esc(t.short)}<small>${esc(t.repo)}</small></span></button>`).join('');
$('tool-nav').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectTool(b.dataset.tool)));
$('controls').addEventListener('submit',async e=>{
 e.preventDefault();const tool=current;controller=new AbortController();const activeController=controller;
 $('run').disabled=true;$('run').textContent='Running original code…';$('run-state').textContent='Computing';$('notice').textContent='Running the public Python implementation on '+($('data-mode').value==='upload'?'your selected data locally in this browser…':'the example dataset…');
 try{
  const payload={tool,params:settings()};
  if($('data-mode').value==='upload'){
   if(!uploadFile||!uploadInfo)throw new Error('Choose a file and read its columns first.');
   payload.upload=uploadFile;payload.selection=columnSelection();
  }
  const response=await labFetch('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:activeController.signal});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('The Python service is not connected at this address. Open the full local preview on port 8780; static GitHub Pages alone cannot execute Python.');
  const data=await response.json();if(!response.ok)throw new Error(data.error||'The example could not complete.');if(current===tool)render(data);
 }catch(error){if(error.name!=='AbortError'&&current===tool){$('notice').textContent=error.message;$('run-state').textContent='Could not complete';}}
 finally{if(current===tool&&controller===activeController){$('run').disabled=false;$('run').innerHTML=($('data-mode').value==='upload'?'Run on my data':'Run example')+' <span aria-hidden="true">↗</span>';}}
});
$('source-toggle').addEventListener('click',async()=>{
 const tool=current;const opening=$('implementation').hidden;
 $('implementation').hidden=!opening;$('source-toggle').setAttribute('aria-expanded',String(opening));$('source-toggle').textContent=opening?'Hide implementation':'Read implementation';
 if(!opening)return;
 $('source-path').textContent=TOOLS[tool].source;$('source-code').textContent='Loading original source…';
 try{const response=await labFetch('/api/source?tool='+encodeURIComponent(tool));if(!response.ok)throw new Error();const data=await response.json();if(current===tool)$('source-code').textContent=data.source;}catch{if(current===tool)$('source-code').textContent='Source preview is unavailable here. Use the View on GitHub link above.';}
});
function invalidateResults(){
 last=null;$('results').hidden=true;$('empty').hidden=false;$('notice').textContent='';$('run-state').textContent='Ready to run';
}
function resetUpload(){
 uploadFile=null;uploadInfo=null;$('data-mode').value='example';$('upload-panel').hidden=true;$('upload-file').value='';$('column-select').innerHTML='';$('file-status').textContent='';$('inspect-file').disabled=false;
}
function applyMode(){
 const uploading=$('data-mode').value==='upload';$('upload-panel').hidden=!uploading;
 $('upload-panel').querySelectorAll('input').forEach(el=>{el.disabled=!uploading;});
 const [rows,cols]=UPLOAD_CAPS[current];$('upload-limit').textContent=`Up to 48 KB · ${rows} rows · ${cols} file columns. Header row required. Excel: first sheet, values only.`;
 TOOLS[current].fields.forEach(([key,,options,def,hint])=>{
  const label=$('input-'+key).closest('label');label.hidden=uploading&&['seed','samples','missing'].includes(key);
  label.querySelector('small').textContent=uploading&&key==='components'?'Choose fewer components than selected input columns.':uploading&&key==='clusters'?'Groups are fitted using all selected input columns.':hint;
 });
 $('empty-description').textContent=uploading?'Choose your columns, then run the original code on the uploaded data.':TOOLS[current].empty;
 $('run').innerHTML=(uploading?'Run on my data':'Run example')+' <span aria-hidden="true">↗</span>';invalidateResults();
}
function columnSelection(){
 const features=[...document.querySelectorAll('input[name="input-column"]:checked')].map(el=>el.value);
 const outputs=[...document.querySelectorAll('input[name="output-column"]:checked')].map(el=>el.value);
 const selection={features,outputs};
 if(current==='nullspace')selection.target=outputs.map((_,i)=>Number($('target-'+i)?.value));
 return selection;
}
function renderColumns(){
 const numeric=uploadInfo.columns.filter(c=>c.numeric),supervised=['pls','propensity','clusterpls','nullspace'].includes(current);
 const defaultOut=supervised?uploadInfo.columns[uploadInfo.columns.length-1].name:null;
 $('column-select').innerHTML=`<fieldset class="column-group"><legend>Input columns · choose 2–6</legend>${numeric.map(c=>`<label class="column-choice"><input type="checkbox" name="input-column" value="${esc(c.name)}" ${c.name!==defaultOut?'checked':''}><span>${esc(c.name)}${c.missing?`<small>${c.missing} missing cells</small>`:''}</span></label>`).join('')}</fieldset>`+(supervised?`<fieldset class="column-group"><legend>${current==='propensity'?'Action column · choose one':'Output columns · choose 1–2'}</legend>${uploadInfo.columns.filter(c=>current==='propensity'||c.numeric).map(c=>`<label class="column-choice"><input type="checkbox" name="output-column" value="${esc(c.name)}" ${c.name===defaultOut?'checked':''}><span>${esc(c.name)}</span></label>`).join('')}</fieldset>`:'')+'<div id="target-fields"></div>';
 const refreshTargets=()=>{
  if(current!=='nullspace')return;
  const chosen=[...document.querySelectorAll('input[name="output-column"]:checked')].map(el=>el.value);
  $('target-fields').innerHTML=chosen.map((name,i)=>`<label class="field"><span class="field-label">Target: ${esc(name)}</span><input class="target-input" id="target-${i}" type="number" step="any" required aria-label="Target for ${esc(name)}"></label>`).join('');
 };
 $('column-select').querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{
  if(el.checked){const other=el.name==='output-column'?'input-column':'output-column';for(const c of document.querySelectorAll(`input[name="${other}"]`))if(c.value===el.value)c.checked=false;}
  refreshTargets();invalidateResults();
 }));refreshTargets();
}
$('data-mode').addEventListener('change',applyMode);
$('upload-file').addEventListener('change',()=>{uploadFile=null;uploadInfo=null;$('column-select').innerHTML='';$('file-status').textContent='';invalidateResults();});
$('inspect-file').addEventListener('click',async()=>{
 const tool=current,chosen=$('upload-file').files[0];
 if(!chosen){$('file-status').textContent='Choose a CSV or .xlsx file first.';return;}
 if(chosen.size>48*1024){$('file-status').textContent='File exceeds 48 KB. Use a smaller subset or run the full project from GitHub.';return;}
 $('inspect-file').disabled=true;$('file-status').textContent='Reading file columns…';
 try{
  const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(chosen);});
  const file={name:chosen.name,content};
  const response=await labFetch('/api/inspect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tool,upload:file})});
  const info=await response.json();if(!response.ok)throw new Error(info.error||'File could not be read.');
  if(current!==tool||$('upload-file').files[0]!==chosen)return;uploadFile=file;uploadInfo=info;renderColumns();$('file-status').textContent=`${info.rows} rows · ${info.columns.length} columns. Choose the roles below, then run the tool.`;
 }catch(error){if(current===tool){uploadFile=null;uploadInfo=null;$('file-status').textContent=error.message||'File could not be read.';}}
 finally{if(current===tool)$('inspect-file').disabled=false;}
});
selectTool(new URLSearchParams(location.search).get('tool')||'missing');
