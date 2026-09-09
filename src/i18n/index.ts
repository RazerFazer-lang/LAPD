import { de } from './de';
import { en } from './en';
export type Locale='de'|'en';
export const dictionaries={de,en};
export const t=(locale:Locale,key:string,vars:Record<string,string|number>={})=>{const value=key.split('.').reduce<any>((acc,k)=>acc?.[k],dictionaries[locale]);if(typeof value!=='string')return key;return value.replace(/\{(\w+)\}/g,(_,k)=>String(vars[k]??`{${k}}`));};
