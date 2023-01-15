import expressLoader from './express';
import socketLoader from './socket';

export default async ({ expressApp, io }) => {
  await expressLoader(expressApp);
  await socketLoader(io);
};
