import { MongoMemoryServer } from 'mongodb-memory-server';
import { MonkModule, MONK_MANAGER_TOKEN } from '../src';
import { Module, Injectable, Inject } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ICollection } from 'monk';

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

class User {
  id: string;
  name: string;
}

@Injectable()
class UserService {
  constructor(
    @Inject('COLLECTION_USERS') readonly usersCollection: ICollection<User>,
  ) {
  }

  async get(id: string) {
    await this.usersCollection.findOne(id);
  }

  async save(user: User) {
    return await this.usersCollection.insert(user);
  }
}

@Module({
  imports: [
    MonkModule.forFeatures(['users']),
  ],
  providers: [UserService],
  exports: [UserService],
})
class UserModule {
} 

@Module({
  imports: [
    MonkModule.forRootAsync({
      database: {
        useFactory: async (ms: MongoServer) => {
          const server = await ms.startServer();
          const fullString = await server.getConnectionString();
          return fullString.slice(10);
        },
        inject: [MongoServer],
        imports: [MongoServerModule],
      },
    }),
    UserModule,
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
    const userService = module.get(UserService);
    console.log({manager, userService});

    await module.get(MongoServer).stopServer();
    expect(module).toBeDefined();
    expect(manager).toBeDefined();
  })
});
