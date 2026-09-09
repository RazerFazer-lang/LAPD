import { describe, expect, it } from 'vitest';
import { cloneState } from '../src/game/state';
import { buildFinancialSnapshot, createSaveEnvelope, migrateSave, scoreReputation, updatePersonnel } from '../src/game/management';
import { generatePatients, chooseHospital, admit } from '../src/game/hospital';
import { calculateRoute } from '../src/game/routing';

describe('management systems',()=>{
  it('calculates finance snapshots',()=>{const s=cloneState();const x=buildFinancialSnapshot(s.finance,s.personnel,s.units);expect(x.revenue).toBeGreaterThanOrEqual(0);expect(x.reserve).toBeGreaterThanOrEqual(0)});
  it('updates dispatcher fatigue and error rate under load',()=>{const s=cloneState();s.personnel=[{id:'p',name:'A',role:'PLAYER',experience:20,stress:40,salary:5000,performance:70,errorRate:5,shift:'MORNING',active:true,fatigue:0}];const n=updatePersonnel(s.personnel,2,60)[0];expect(n.stress).toBeGreaterThan(s.personnel[0].stress);expect(n.errorRate).toBeGreaterThanOrEqual(0)});
  it('creates versioned saves and rejects malformed versions',()=>{const s=cloneState();const env=createSaveEnvelope(s);expect(migrateSave(env)?.version).toBe(2);expect(migrateSave({schemaVersion:99,state:s})).toBeNull()});
  it('produces bounded reputation scores',()=>{expect(scoreReputation(cloneState())).toBeGreaterThanOrEqual(0);expect(scoreReputation(cloneState())).toBeLessThanOrEqual(100)});
  it('generates patients and admits them',()=>{const s=cloneState();const incident={id:'I',type:'MCI' as const,priority:1,location:{x:50,y:50},address:'1 Pine',status:'NEW' as const,summary:'MCI',createdAt:Date.now(),ageMinutes:0,stageIndex:0,stages:['x'],requiredServices:['EMS','FIRE'] as const,unitIds:[],patients:3,escalation:10,danger:50,objective:'triage'};const patients=generatePatients(incident);expect(patients).toHaveLength(3);const h=chooseHospital(s.hospitals,patients[0]);expect(h).not.toBeNull();expect(admit(h!,patients[0]).accepted).toBe(true)});
  it('routes through the road graph',()=>{const s=cloneState();const r=calculateRoute(s.roads!.nodes,s.roads!.edges,{x:5,y:5},{x:95,y:95});expect(r.path.length).toBeGreaterThan(1);expect(r.distance).toBeGreaterThan(0);expect(r.etaMinutes).toBeGreaterThan(0)});
});
