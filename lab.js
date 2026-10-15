'use strict';

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const palette=['#2b7157','#ca8050','#7888b6','#b1ad57'];
let current='missing',last=null,controller=null,uploadFile=null,uploadInfo=null,resultPage=0;

const fmt=v=>typeof v==='number'?(v===0?'0':Math.abs(v)<.0001?v.toExponential(2):Number.isInteger(v)?String(v):v.toFixed(4)):v==null?'Unavailable':String(v);
function repoUrl(t){return 'https://github.com/Saeid-Tayebi/'+TOOLS[t].repo;}
function settings(){return Object.fromEntries(TOOLS[current].fields.map(([key,,options])=>{const val=$('input-'+key).value;return [key,typeof options[0][0]==='number'?Number(val):val];}));}
function selectTool(key){
 if(!TOOLS[key])key='missing';if(controller)controller.abort();controller=null;current=key;last=null;$('cancel-run').hidden=true;resetUpload();
 document.querySelector('.back').href='./#tool-'+key;
 const t=TOOLS[key];document.title=t.short+' | Saeid Tayebi Interactive Lab';
 history.replaceState(null,'','?tool='+encodeURIComponent(key));
 document.querySelectorAll('#tool-nav button').forEach(b=>{const on=b.dataset.tool===key;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false');});
 for(const [id,value] of Object.entries({title:t.name,category:t.category,breadcrumb:t.short,description:t.description,question:t.question,'empty-description':t.empty}))$(id).textContent=value;
 $('repo-link').href=repoUrl(key);$('full-link').href=repoUrl(key);$('example-link').href=repoUrl(key)+'/blob/main/'+t.example;
 $('fields').innerHTML=t.fields.map(([key,label,options,def,hint])=>`<label class="field" for="input-${key}"><span class="field-label">${esc(label)}</span><select id="input-${key}" name="${key}" aria-describedby="hint-${key}">${options.map(([v,l])=>`<option value="${v}" ${v===def?'selected':''}>${esc(l)}</option>`).join('')}</select><small id="hint-${key}">${esc(hint)}</small></label>`).join('');
 $('fields').querySelectorAll('select').forEach(el=>el.addEventListener('change',()=>{if(controller){invalidateResults();$('run').disabled=false;if($('data-mode').value==='upload')renderDataPreview();}if(last){$('run-state').textContent='Settings changed';$('notice').textContent='Settings changed. Run again to update the displayed results.';}}));
 $('empty').hidden=false;$('results').hidden=true;$('notice').textContent='';$('run-state').textContent='Ready to run';$('run').disabled=false;$('run').innerHTML=($('data-mode').value==='upload'?'Run on my data':'Run example')+' <span aria-hidden="true">↗</span>';
 $('snippet').textContent='Run an example to inspect the exact call.';$('implementation').hidden=true;$('source-toggle').setAttribute('aria-expanded','false');$('source-toggle').textContent='Read implementation';
}
function range(vals){let lo=Math.min(...vals),hi=Math.max(...vals);if(lo===hi){const pad=Math.max(Math.abs(lo)*.1,1e-15);lo-=pad;hi+=pad;}const pad=(hi-lo)*.09;return [lo-pad,hi+pad];}
function svgPlot(c){
 const W=c.kind==='bar'?Math.max(520,c.values.length*42):520,H=310,L=60,R=18,T=15,B=65,w=W-L-R,h=H-T-B;
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
 return `<div class="plot-scroll"><svg style="${c.kind==='bar'?'min-width:'+W+'px;':''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}"><title>${esc(c.title)}</title>${content}</svg></div>${legend}<p class="plot-note">Hover over a point or bar for its value. Exact results are also available in the result table below.</p>`;
}
function heatmap(c){
 const shown=100,vals=c.after.flat().filter(Number.isFinite),lo=Math.min(...vals),hi=Math.max(...vals);
 const grid=(all,label)=>{const data=all.slice(0,shown);return `<div><h4>${label}</h4><div class="heat-grid" style="grid-template-columns:repeat(${data[0].length},1fr)">${data.map((row,i)=>row.map((v,j)=>`<div class="cell ${v===null?'missing':''}" style="background:rgba(24,101,97,${v===null?.2:.15+.8*(v-lo)/(hi-lo||1)})" title="Row ${i+1}, column ${j+1}: ${v===null?'missing':fmt(v)}"></div>`).join('')).join('')}</div></div>`;};
 return `<div class="heatmaps">${grid(c.before,'Before · coral cells are missing')}${grid(c.after,'After · estimated values')}</div><p class="heat-label">Showing ${Math.min(c.before.length,shown)} of ${c.before.length} rows · ${c.before[0].length} columns. Every selected row is processed; this visual is a preview.</p>`;
}
function renderResultTable(){
 if(!last)return;const tab=last.table,size=100,start=resultPage*size,rows=tab.rows.slice(start,start+size);
 $('table').innerHTML=`<table><caption>Returned values · rows ${start+1}–${start+rows.length} of ${tab.rows.length}</caption><thead><tr>${tab.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(fmt(v))}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="table-pagination"><button type="button" id="result-prev" ${resultPage===0?'disabled':''}>Previous rows</button><span>Page ${resultPage+1} of ${Math.max(1,Math.ceil(tab.rows.length/size))}</span><button type="button" id="result-next" ${start+size>=tab.rows.length?'disabled':''}>Next rows</button></div>`;
 $('result-prev').onclick=()=>{resultPage--;renderResultTable();};$('result-next').onclick=()=>{resultPage++;renderResultTable();};
}
function render(data){
 last=data;$('empty').hidden=true;$('results').hidden=false;
 $('metrics').innerHTML=data.metrics.map(m=>`<div class="metric"><span>${esc(m.label)}</span><strong>${esc(fmt(m.value))}<small>${esc(m.unit)}</small></strong></div>`).join('');
 $('charts').innerHTML=data.charts.map(c=>`<article class="chart"><h3>${esc(c.title)}</h3>${c.kind==='heatmap'?heatmap(c):svgPlot(c)}</article>`).join('');
 $('insight').textContent=data.insight;$('dataset').textContent=data.dataset;$('snippet').textContent=data.snippet;
 $('result-settings').textContent=(data.uploaded?'YOUR DATA · ':'')+Object.entries(data.settings).map(([k,v])=>k+': '+v).join(' · ')+' · '+(data.cached?'cached run':data.seconds+' seconds');
 $('configuration').textContent=data.config?JSON.stringify(data.config,null,2):'';
 resultPage=0;renderResultTable();
 $('run-state').textContent='Completed';$('notice').textContent='';document.querySelector('.output-heading').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
$('tool-nav').innerHTML=Object.entries(TOOLS).map(([key,t],i)=>`<button type="button" data-tool="${key}"><span class="number">${String(i+1).padStart(2,'0')}</span><span class="nav-title">${esc(t.short)}<small>${esc(t.repo)}</small></span></button>`).join('');
$('tool-nav').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectTool(b.dataset.tool)));
$('controls').addEventListener('submit',async e=>{
 e.preventDefault();const tool=current;controller=new AbortController();const activeController=controller;
 $('run').disabled=true;$('cancel-run').hidden=false;$('run').textContent='Running original code…';$('run-state').textContent='Computing';$('notice').textContent='Running the public Python implementation on '+($('data-mode').value==='upload'?'your uploaded data…':'the example dataset…');
 try{
  const payload={tool,params:settings()};
  if($('data-mode').value==='upload'){
   if(!uploadFile||!uploadInfo)throw new Error('Choose a file and read its columns first.');
   payload.upload=uploadFile;payload.selection=columnSelection();
  }
  const response=await labFetch('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:activeController.signal});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('The analysis connection is unavailable. Reload this page and try again.');
  const data=await response.json();if(!response.ok)throw new Error(data.error||'The example could not complete.');if(current===tool)render(data);
 }catch(error){if(error.name!=='AbortError'&&current===tool){$('notice').textContent=error.message;$('run-state').textContent='Could not complete';}}
 finally{if(current===tool&&controller===activeController){controller=null;$('cancel-run').hidden=true;$('run').disabled=false;if($('data-mode').value==='upload')renderDataPreview();$('run').innerHTML=($('data-mode').value==='upload'?'Run on my data':'Run example')+' <span aria-hidden="true">↗</span>';}}
});
$('cancel-run').addEventListener('click',()=>{controller?.abort();$('cancel-run').hidden=true;$('notice').textContent='Analysis cancelled. You can adjust your selection and run again.';$('run-state').textContent='Cancelled';});
$('source-toggle').addEventListener('click',async()=>{
 const tool=current;const opening=$('implementation').hidden;
 $('implementation').hidden=!opening;$('source-toggle').setAttribute('aria-expanded',String(opening));$('source-toggle').textContent=opening?'Hide implementation':'Read implementation';
 if(!opening)return;
 $('source-path').textContent=TOOLS[tool].source;$('source-code').textContent='Loading original source…';
 try{const response=await labFetch('/api/source?tool='+encodeURIComponent(tool));if(!response.ok)throw new Error();const data=await response.json();if(current===tool)$('source-code').textContent=data.source;}catch{if(current===tool)$('source-code').textContent='Source preview is unavailable here. Use the View on GitHub link above.';}
});
function invalidateResults(){
 if(controller){controller.abort();controller=null;$('cancel-run').hidden=true;$('inspect-file').disabled=false;}
 last=null;$('results').hidden=true;$('empty').hidden=false;$('notice').textContent='';$('run-state').textContent='Ready to run';
}
function resetUpload(){
 uploadFile=null;uploadInfo=null;$('data-preview').hidden=true;$('preview-table').innerHTML='';$('data-mode').value='example';$('upload-panel').hidden=true;$('upload-file').value='';$('column-select').innerHTML='';$('file-status').textContent='';$('inspect-file').disabled=false;
}
function applyMode(){
 const uploading=$('data-mode').value==='upload';$('upload-panel').hidden=!uploading;
 $('upload-panel').querySelectorAll('input').forEach(el=>{el.disabled=!uploading;});
 $('upload-limit').textContent='Up to 2 MB · 1,000 data rows · 20 columns. Include a header row. Excel: first sheet, values only.';
 $('data-preview').hidden=!uploading||!uploadInfo;
 TOOLS[current].fields.forEach(([key,,options,def,hint])=>{
  const el=$('input-'+key);if(!uploading){el.innerHTML=options.map(([v,l])=>`<option value="${v}" ${v===def?'selected':''}>${esc(l)}</option>`).join('');}
  const label=el.closest('label');label.hidden=uploading&&['seed','samples','missing'].includes(key);
  label.querySelector('small').textContent=uploading&&key==='components'?'Choose fewer components than selected input columns.':uploading&&key==='clusters'?'Groups are fitted using all selected input columns.':hint;
 });
 $('empty-description').textContent=uploading?'Choose your columns, then run the original code on the uploaded data.':TOOLS[current].empty;
 $('run').innerHTML=(uploading?'Run on my data':'Run example')+' <span aria-hidden="true">↗</span>';invalidateResults();if(uploading&&uploadInfo){updateUploadOptions();renderDataPreview();}else $('run').disabled=uploading;
}
function columnSelection(){
 const features=[...document.querySelectorAll('input[name="input-column"]:checked')].map(el=>el.value);
 const outputs=[...document.querySelectorAll('input[name="output-column"]:checked')].map(el=>el.value);
 const selection={features,outputs};
 if(current==='nullspace')selection.target=outputs.map((_,i)=>Number($('target-'+i)?.value));
 return selection;
}
function updateUploadOptions(){
 if(!uploadInfo)return;
 const n=columnSelection().features.length;
 for(const key of ['components','keep']){const select=$('input-'+key);if(!select)continue;
 const previous=Number(select.value),max=key==='keep'?n:Math.max(1,Math.min(n-1,uploadInfo.rows-2));
 select.innerHTML=Array.from({length:max},(_,i)=>`<option value="${i+1}">${i+1} ${key==='keep'?'variable':'component'}${i?'s':''}</option>`).join('');select.value=String(Math.max(1,Math.min(previous,max)));
 }
}
function renderDataPreview(){
 if(!uploadInfo){$('data-preview').hidden=true;return;}
 $('data-preview').hidden=$('data-mode').value!=='upload';
 const selection=columnSelection(),features=new Set(selection.features),outputs=new Set(selection.outputs);
 const cols=uploadInfo.columns,rows=uploadInfo.preview;
 const role=c=>features.has(c.name)?'input':outputs.has(c.name)?'output':'excluded';
 $('preview-summary').textContent=`${uploadFile.name} · ${uploadInfo.rows.toLocaleString()} rows × ${cols.length} columns`;
 $('preview-table').innerHTML=`<table><caption>First ${rows.length} rows. All ${uploadInfo.rows.toLocaleString()} rows in selected columns are used for analysis.</caption><thead><tr><th scope="col" class="row-index">Row</th>${cols.map(c=>`<th scope="col" class="preview-${role(c)}">${esc(c.name)}<small>${role(c)==='input'?'Input':role(c)==='output'?(current==='propensity'?'Action':'Output'):'Excluded'} · ${esc(c.kind|| (c.numeric?'numeric':'text'))}${c.missing?' · '+c.missing+' missing':''}</small></th>`).join('')}</tr></thead><tbody>${rows.map((row,i)=>`<tr><th scope="row" class="row-index">${i+1}</th>${row.map((v,j)=>{const state=uploadInfo.previewStates?.[i]?.[j],missing=state==='missing'||v===null;return `<td class="preview-${role(cols[j])} ${missing?'preview-missing':''}" title="${esc(cols[j].name)} · ${missing?'Missing value':role(cols[j])}">${missing?'<span aria-label="Missing value">—</span>':esc(typeof v==='number'?fmt(v):v)}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;
 let problem='';if(uploadInfo.rows<(current==='propensity'?40:20))problem='Provide at least '+(current==='propensity'?40:20)+' data rows.';if(features.size<2)problem='Choose at least two numeric input columns.';
 if(['pls','nullspace','clusterpls','propensity'].includes(current)&&!outputs.size)problem='Choose an output or action column.';
 if(outputs.size>(current==='propensity'?1:2))problem='Choose '+(current==='propensity'?'one action column.':'at most two output columns.');
 const selected=cols.filter(c=>features.has(c.name));
 if(current!=='missing'&&selected.some(c=>c.missing))problem='Selected inputs contain missing cells. Exclude those columns or fill them with the missing-data tool first.';
 if(current==='missing'&&!selected.some(c=>c.missing))problem='Choose input columns with missing cells, or use the built-in reconstruction example.';
 $('preview-status').textContent=problem||`${uploadInfo.rows.toLocaleString()} rows ready · ${features.size} inputs${outputs.size?' · '+outputs.size+(current==='propensity'?' action':' outputs'):''} · ${cols.length-features.size-outputs.size} columns excluded.`;
 $('preview-status').classList.toggle('needs-attention',!!problem);$('run').disabled=!!problem||!!controller;
}
function renderColumns(){
 const numeric=uploadInfo.columns.filter(c=>c.numeric&&c.eligible!==false),supervised=['pls','propensity','clusterpls','nullspace'].includes(current);
 const eligibleOutputs=current==='propensity'?uploadInfo.columns:numeric;
 const defaultOut=supervised?eligibleOutputs[eligibleOutputs.length-1]?.name:null;
 $('column-select').innerHTML=`<fieldset class="column-group"><legend>Input columns · choose 2–20</legend>${numeric.map(c=>`<label class="column-choice"><input type="checkbox" name="input-column" value="${esc(c.name)}" ${c.name!==defaultOut?'checked':''}><span>${esc(c.name)}${c.missing?`<small>${c.missing} missing cells</small>`:''}</span></label>`).join('')}</fieldset>`+(supervised?`<fieldset class="column-group"><legend>${current==='propensity'?'Action column · choose one':'Output columns · choose 1–2'}</legend>${uploadInfo.columns.filter(c=>current==='propensity'||c.numeric).map(c=>`<label class="column-choice"><input type="checkbox" name="output-column" value="${esc(c.name)}" ${c.name===defaultOut?'checked':''}><span>${esc(c.name)}</span></label>`).join('')}</fieldset>`:'')+'<div id="target-fields"></div>';
 const refreshTargets=()=>{
  if(current!=='nullspace')return;
  const chosen=[...document.querySelectorAll('input[name="output-column"]:checked')].map(el=>el.value);
  $('target-fields').innerHTML=chosen.map((name,i)=>`<label class="field"><span class="field-label">Target: ${esc(name)}</span><input class="target-input" id="target-${i}" type="number" step="any" required aria-label="Target for ${esc(name)}"></label>`).join('');
 };
 $('column-select').querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{
  if(el.checked){const other=el.name==='output-column'?'input-column':'output-column';for(const c of document.querySelectorAll(`input[name="${other}"]`))if(c.value===el.value)c.checked=false;}
  refreshTargets();updateUploadOptions();invalidateResults();renderDataPreview();
 }));refreshTargets();updateUploadOptions();renderDataPreview();
}
$('data-mode').addEventListener('change',applyMode);
$('upload-file').addEventListener('change',()=>{uploadFile=null;uploadInfo=null;$('column-select').innerHTML='';$('file-status').textContent='';$('data-preview').hidden=true;invalidateResults();$('run').disabled=true;if($('upload-file').files[0])$('inspect-file').click();});
$('inspect-file').addEventListener('click',async()=>{
 const tool=current,chosen=$('upload-file').files[0];
 if(!chosen){$('file-status').textContent='Choose a CSV or .xlsx file first.';return;}
 if(chosen.size>LAB_LIMITS.fileBytes){$('file-status').textContent='File exceeds 2 MB. Use a smaller subset or run the full project from GitHub.';return;}
 if(controller)controller.abort();controller=new AbortController();const activeInspection=controller;
 $('inspect-file').disabled=true;$('cancel-run').hidden=false;$('file-status').textContent='Reading file columns…';
 try{
  const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(chosen);});
  const file={name:chosen.name,content};
  const response=await labFetch('/api/inspect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tool,upload:file}),signal:activeInspection.signal});
  const info=await response.json();if(!response.ok)throw new Error(info.error||'File could not be read.');
  if(current!==tool||$('upload-file').files[0]!==chosen)return;uploadFile=file;uploadInfo=info;$('notice').textContent='';renderColumns();$('file-status').textContent=`${info.rows} rows · ${info.columns.length} columns. Choose the roles below, then run the tool.`;
 }catch(error){if(current===tool){uploadFile=null;uploadInfo=null;$('data-preview').hidden=true;$('file-status').textContent=error.name==='AbortError'?'File preview cancelled.':error.message||'File could not be read.';}}
 finally{if(current===tool&&controller===activeInspection){controller=null;$('inspect-file').disabled=false;$('cancel-run').hidden=true;if(uploadInfo)renderDataPreview();else $('run').disabled=true;}}
});
selectTool(new URLSearchParams(location.search).get('tool')||'missing');
