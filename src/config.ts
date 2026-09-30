import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000), NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/waleads'), REPOSITORY_MODE: z.enum(['mongo', 'memory']).default('mongo'),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1), WHATSAPP_APP_SECRET: z.string().min(1), JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.string().default('info')
});
export type Config = z.infer<typeof schema>;
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config { return schema.parse(env); }
