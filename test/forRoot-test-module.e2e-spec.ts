import { MongoMemoryServer } from 'mongodb-memory-server';
import { MonkModule, MONK_MANAGER_TOKEN } from '../src';
import { Module, Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Injectable()
class MongoServer {
  private server: MongoMemoryServer;

  async startServer() {
    this.server = new MongoMemoryServer();

    await this.server.start();

    return this.server;
  }

  async stopServer() {
    await this.server.stop();
  }
}

@Module({
  providers: [MongoServer],
  exports: [MongoServer]
})
class MongoServerModule {}

@Module({
  imports: [
    MonkModule.forRoot({
      database: 'TEST_DATABASE_CXN',
      options: {
        ssl: true,
      },
      // database: {
      //   useFactory: async (ms: MongoServer) => {
      //     const server = await ms.startServer();
      //     const fullString = await server.getConnectionString();
      //     return fullString.slice(10);
      //   },
      //   inject: [MongoServer],
      //   imports: [MongoServerModule],
      // },
      // collections: [
      //   'users',
      // ],
    })
  ]
})
class AppRootModule {}

describe('MonkModule forRootAsync', () => {
  it('', async () => {
    jest.setTimeout(1000000);
    const module = await NestFactory.createApplicationContext(
      AppRootModule,
      {
        logger: false,
      },
    );

    const manager = module.get(MONK_MANAGER_TOKEN);

    expect(module).toBeDefined();
    expect(manager).toBeDefined();
  })
});
