import { State } from 'arca-redux-v4';

export type rowItem = State['Source']['AAU-Concretize'][0];

type treeTemplate<T> = rowItem & {
  items?: T[],
};
export interface tree extends treeTemplate<tree> { }
