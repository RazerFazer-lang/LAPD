import './state';

declare module './state' {
  interface Unit {
    ownerId?: string;
    ownerName?: string;
  }

  interface Incident {
    ownerId?: string;
  }
}
