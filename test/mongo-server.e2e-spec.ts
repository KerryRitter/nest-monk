import { MongoMemoryServer } from 'mongodb-memory-server';
import monk from 'monk';

async function go() {
  const server = new MongoMemoryServer();
  await server.start();
  const cxn = await server.getConnectionString();
  console.log(`Connecting to ${cxn}...`);
  await monk(cxn);
  console.log('Connected!');
}
go();