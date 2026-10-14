'use strict';
// Public Pages build: original Python executes locally in a dedicated Web Worker.
let pythonWorker,initPromise,pending=null,sequence=0,loading=true,timer=null;
const recentRuns=[];
function status(message){const el=document.getElementById('notice');if(el)el.textContent=message;}
function createPythonWorker(){
 pythonWorker=new Worker('python-worker.js');loading=true;
 pythonWorker.onmessage=({data})=>{
  if(data.type==='status')status(data.message+' Your file stays in this browser.');
  if(data.type==='ready'){loading=false;status('Python is ready. Your file stays in this browser.');}
  if(data.type==='running'&&pending){clearTimeout(timer);timer=setTimeout(()=>fail('The analysis reached its 12-second limit. Try a smaller dataset or use the full GitHub project.',true),12000);status('Running your original Python code in this browser…');}
  if(data.type==='result'&&pending?.id===data.id){clearTimeout(timer);const p=pending;pending=null;data.result.seconds=Number(((performance.now()-p.started)/1000).toFixed(2));p.resolve(data.result);}
  if(data.type==='error')fail('The Python analysis could not complete: '+data.message,loading);
 };
 pythonWorker.onerror=()=>fail('The browser Python runtime could not load. Check your connection, try a current desktop browser, or use the full GitHub project.',true);
}
function fail(message,reset=false){clearTimeout(timer);if(pending){pending.reject(new Error(message));pending=null;}if(reset){pythonWorker?.terminate();pythonWorker=null;loading=true;}}
async function browserRequest(operation,payload,signal){
 if(pending)throw new Error('Another analysis is running. Please wait for it to finish.');
 const now=Date.now();while(recentRuns.length&&recentRuns[0]<now-60000)recentRuns.shift();
 if(recentRuns.length>=8)throw new Error('Please limit this demo to eight requests per minute.');recentRuns.push(now);
 if(!pythonWorker)createPythonWorker();
 return new Promise((resolve,reject)=>{
  const id=++sequence;pending={id,resolve,reject,started:performance.now()};
  // Initialization is separate from the computation limit.
  timer=setTimeout(()=>fail('Python initialization took too long. Please retry on a stable connection.',true),180000);
  if(signal){if(signal.aborted){fail('Request cancelled.',true);return;}signal.addEventListener('abort',()=>{if(pending?.id===id)fail('Request cancelled.',true);},{once:true});}
  pythonWorker.postMessage({...payload,operation,id});
 });
}
async function labFetch(url,options={}){
 if(url.startsWith('/api/source')){
  const tool=new URL(url,location.origin).searchParams.get('tool');
  const response=await fetch('sources.json');const sources=await response.json();
  return {ok:!!sources[tool],headers:new Headers({'Content-Type':'application/json'}),json:async()=>sources[tool]||{error:'Unknown tool.'}};
 }
 try{
  const payload=JSON.parse(options.body||'{}');const data=await browserRequest(url==='/api/inspect'?'inspect':'run',payload,options.signal);
  return {ok:true,headers:new Headers({'Content-Type':'application/json'}),json:async()=>data};
 }catch(error){return {ok:false,headers:new Headers({'Content-Type':'application/json'}),json:async()=>({error:error.message})};}
}
