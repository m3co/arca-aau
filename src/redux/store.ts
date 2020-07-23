import { createArcaRedux, createArcaSocket } from 'arca-redux-v4';

export const store = createArcaRedux();
export const socket = createArcaSocket(store);
