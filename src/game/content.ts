import { CITIES, FACILITY_CATALOG, INCIDENT_CATALOG, UNIT_CATALOG, WEATHER_RULES, ROLE_LABELS } from './catalog';

export interface ContentPack{version:number;region:string;cities:typeof CITIES;facilities:typeof FACILITY_CATALOG;units:typeof UNIT_CATALOG;incidents:typeof INCIDENT_CATALOG;weather:typeof WEATHER_RULES;roles:typeof ROLE_LABELS}
export const BUILTIN_CONTENT:ContentPack={version:1,region:'Redwood State',cities:CITIES,facilities:FACILITY_CATALOG,units:UNIT_CATALOG,incidents:INCIDENT_CATALOG,weather:WEATHER_RULES,roles:ROLE_LABELS};
export function validateContentPack(pack:unknown):pack is ContentPack{const p=pack as Partial<ContentPack>|null;return !!p&&p.version===1&&p.region==='Redwood State'&&Array.isArray(p.cities)&&!!p.facilities&&!!p.units&&Array.isArray(p.incidents)&&!!p.weather&&!!p.roles}
export function listContentStats(pack:ContentPack){return{cities:pack.cities.length,facilityTypes:Object.keys(pack.facilities).length,unitTypes:Object.keys(pack.units).length,incidentTypes:pack.incidents.length,weatherTypes:Object.keys(pack.weather).length,roles:Object.keys(pack.roles).length}}
