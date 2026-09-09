import type { MapPoint, RoadEdge, RoadNode } from './state';

export interface RouteResult{path:MapPoint[];distance:number;etaMinutes:number;blocked:boolean;}
const distance=(a:MapPoint,b:MapPoint)=>Math.hypot(a.x-b.x,a.y-b.y);
function nearest(nodes:RoadNode[],p:MapPoint){return nodes.reduce((best,n)=>!best||distance(n.position,p)<distance(best.position,p)?n:best,null as RoadNode|null)}
export function calculateRoute(nodes:RoadNode[],edges:RoadEdge[],from:MapPoint,to:MapPoint):RouteResult{
 const start=nearest(nodes,from),goal=nearest(nodes,to);if(!start||!goal)return{path:[from,to],distance:distance(from,to),etaMinutes:0,blocked:false};
 const cost=new Map(nodes.map(n=>[n.id,Infinity]));const previous=new Map<string,string>();const open=new Set([start.id]);cost.set(start.id,0);let blocked=false;
 while(open.size){const current=[...open].sort((a,b)=>(cost.get(a)??Infinity)-(cost.get(b)??Infinity))[0];open.delete(current);if(current===goal.id)break;for(const edge of edges){if(edge.from!==current)continue;if(edge.blocked){blocked=true;continue}const a=nodes.find(n=>n.id===edge.from)?.position;const b=nodes.find(n=>n.id===edge.to)?.position;if(!a||!b)continue;const candidate=(cost.get(current)??Infinity)+distance(a,b)*(1+edge.traffic/100);if(candidate<(cost.get(edge.to)??Infinity)){cost.set(edge.to,candidate);previous.set(edge.to,current);open.add(edge.to)}}}
 const ids=[goal.id];let cursor=goal.id;while(cursor!==start.id&&previous.has(cursor)){cursor=previous.get(cursor)!;ids.push(cursor)}ids.reverse();const path=[from,...ids.map(id=>nodes.find(n=>n.id===id)?.position).filter(Boolean) as MapPoint[],to];const dist=path.reduce((sum,p,i)=>i?sum+distance(path[i-1],p):0,0);const avgTraffic=path.length?edges.reduce((s,e)=>s+e.traffic,0)/Math.max(1,edges.length):0;return{path,distance:dist,etaMinutes:(dist/35)*60*(1+avgTraffic/100),blocked};
}
export function nextRoutePoint(path:MapPoint[]|undefined,index:number|undefined){if(!path||path.length<2)return null;const i=Math.max(0,Math.min(path.length-2,index??0));return path[i+1]}
export function routeProgress(path:MapPoint[]|undefined,index:number|undefined){if(!path||path.length<2)return 1;return Math.max(0,Math.min(1,(index??0)/(path.length-1)))}
