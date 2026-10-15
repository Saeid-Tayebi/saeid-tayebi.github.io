'use strict';
let python,ready;
async function initialize(){
 postMessage({type:'status',message:'Loading Python and scientific libraries for the first launch…'});
 importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
 python=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'});
 await python.loadPackage(['numpy','scipy','scikit-learn','matplotlib','micropip']);
 await python.runPythonAsync("import micropip\nawait micropip.install(['plotly==5.24.1', 'openpyxl==3.1.5', 'defusedxml==0.7.1'])");
 const response=await fetch('source.zip?v=66dc5d968f62');if(!response.ok)throw new Error('The Python source bundle could not be loaded.');
 python.unpackArchive(await response.arrayBuffer(),'zip',{extractDir:'/app'});
 await python.runPythonAsync("import sys, os\nos.environ['MPLBACKEND']='Agg'\nsys.path.insert(0, '/app')\nimport runner\nimport matplotlib.pyplot\nimport contextlib, io, json, warnings\nfrom uploads import inspect\nfrom uploaded_runs import run_uploaded");
 postMessage({type:'ready'});
}
onmessage=async ({data})=>{
 try{
  if(!ready)ready=initialize();await ready;
  if(data.operation==='warm')return postMessage({type:'result',id:data.id,result:{ok:true}});
  postMessage({type:'running',id:data.id});
  python.globals.set('_job_json',JSON.stringify(data));
  const result=await python.runPythonAsync(`
_job=json.loads(_job_json)
with contextlib.redirect_stdout(io.StringIO()), warnings.catch_warnings():
 warnings.simplefilter('ignore')
 if _job['operation']=='inspect':
  _result=inspect(_job['upload'], _job['tool'])
 elif 'upload' in _job:
  _result=run_uploaded(_job['tool'], _job['params'], _job['upload'], _job['selection'])
 else:
  _result=runner.run(_job['tool'], _job['params'])
 _result=runner.clean(_result)
 _result['cached']=False
 _encoded=json.dumps(_result,allow_nan=False)
# Release uploaded content and intermediate references after responding.
del _job, _job_json, _result
_encoded
`);
  postMessage({type:'result',id:data.id,result:JSON.parse(result)});
 }catch(error){postMessage({type:'error',id:data.id,message:String(error.message||error)});}
};
