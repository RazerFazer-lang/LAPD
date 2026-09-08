export const STARTER_VEHICLE_CALL='state.finance.upgrades+=cost;addVehicle(c,service,safePosition);';

export function patchServerSource(source){
  if(!source.includes(STARTER_VEHICLE_CALL))
    throw new Error('Server source guard: expected starter vehicle call was not found. Refusing to build/run an unexpected server.');
  return source.replace(STARTER_VEHICLE_CALL,'state.finance.upgrades+=cost;');
}
