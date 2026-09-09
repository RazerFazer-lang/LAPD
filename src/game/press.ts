export type NewsSeverity='INFO'|'POSITIVE'|'NEGATIVE'|'CRITICAL';
export interface NewsItem{id:string;headline:string;body:string;severity:NewsSeverity;timestamp:number;impact:number;tags:string[];}

export function makeNews(kind:'SUCCESS'|'DELAY'|'MAJOR_INCIDENT'|'BUDGET'|'PUBLIC_PRESSURE',context:string,impact:number):NewsItem{
 const copy={
  SUCCESS:{headline:'Dispatch Center earns public praise',body:`The Redwood Metro community is reacting positively to ${context}.`,severity:'POSITIVE' as const},
  DELAY:{headline:'Response delays under public scrutiny',body:`Officials are reviewing response performance after ${context}.`,severity:'NEGATIVE' as const},
  MAJOR_INCIDENT:{headline:'Major emergency draws regional attention',body:`A significant emergency involving ${context} has activated multiple agencies.`,severity:'CRITICAL' as const},
  BUDGET:{headline:'County funding review announced',body:`Budget performance is being reviewed after ${context}.`,severity:'INFO' as const},
  PUBLIC_PRESSURE:{headline:'Public pressure increases',body:`Community confidence is changing after ${context}.`,severity:'NEGATIVE' as const},
 }[kind];
 return{id:`NEWS-${Date.now()}-${Math.random().toString(16).slice(2,7)}`,headline:copy.headline,body:copy.body,severity:copy.severity,timestamp:Date.now(),impact,tags:[kind]};
}
export function publicReaction(performance:number,reputation:number){if(performance>90&&reputation>80)return'POSITIVE';if(performance<55||reputation<45)return'NEGATIVE';return'NEUTRAL'}
