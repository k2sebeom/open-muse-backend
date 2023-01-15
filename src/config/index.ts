import 'dotenv/config';

export default {
  port: process.env.PORT,

  api: {
    prefix: '/api',
  },

  muxTokenId: process.env.MUX_TOKEN_ID,
  muxTokenSecret: process.env.MUX_TOKEN_SECRET
};
