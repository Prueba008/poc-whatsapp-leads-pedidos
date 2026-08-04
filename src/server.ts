import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createMemoryRepositories } from './infrastructure/memory/repositories.js';
import { createMongoRepositories } from './infrastructure/mongo/repositories.js';

const config = loadConfig();
if (config.REPOSITORY_MODE === 'mongo') await mongoose.connect(config.MONGO_URI);
const repos = config.REPOSITORY_MODE === 'mongo' ? createMongoRepositories() : createMemoryRepositories();
const server = createApp({ config, repos }).listen(config.PORT, () => console.log(`WALeads escuchando en http://localhost:${config.PORT}`));
async function shutdown() { server.close(); if (config.REPOSITORY_MODE === 'mongo') await mongoose.disconnect(); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
