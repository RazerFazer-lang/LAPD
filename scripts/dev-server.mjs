import { readFile, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { patchServerSource } from './server-source-policy.mjs';

const root=resolve('.');
const sourcePath=resolve(root,'server/index.ts');
const runtimePath=resolve(root,'server/.dev-index.ts');
const source=await readFile(sourcePath,'utf8');
await writeFile(runtimePath,patchServerSource(source),'utf8');

let child;
try{
  child=spawn(process.execPath,[resolve(root,'node_modules/tsx/dist/cli.mjs'),runtimePath],{
    cwd:root,
    stdio:'inherit',
    env:{...process.env,NODE_ENV:'development'},
  });
  const cleanup=async()=>{await rm(runtimePath,{force:true});};
  const exitCode=await new Promise((resolveExit,reject)=>{
    child.on('error',reject);
    child.on('exit',(code,signal)=>resolveExit(typeof code==='number'?code:(signal?1:0)));
  });
  await cleanup();
  process.exitCode=exitCode;
}catch(error){
  await rm(runtimePath,{force:true});
  throw error;
}
