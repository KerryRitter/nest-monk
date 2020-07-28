import { MongoMemoryServer } from 'mongodb-memory-server';
import { Module, Injectable, Inject } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ICollection } from 'monk';
import { MonkModule, MONK_MANAGER_TOKEN, InjectCollection, InjectRepository, Entity } from '../src';

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

/* USERS */
@Entity()
class User {
  _id: string;
  name: string;
}

@Injectable()
class UserService {
  constructor(
    @InjectCollection(User) readonly usersCollection: ICollection<User>,
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
    MonkModule.forFeatures([User]),
  ],
  providers: [UserService],
  exports: [UserService],
})
class UserModule {
} 
/* END USERS */

/* TODOS */
@Entity<Todo>({
  collectionOptions: coll => coll.createIndex('_id'),
})
class Todo {
  _id: string;
  title: string;
  complete: boolean;
}

@Injectable()
class TodoService {
  constructor(
    @InjectRepository(Todo) readonly todosCollection: ICollection<Todo>,
  ) {
  }
}

@Module({
  imports: [
    MonkModule.forFeatures([Todo]),
  ],
  providers: [TodoService],
  exports: [TodoService],
})
class TodoModule {
} 
/* END TODOS */

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
    TodoModule,
    UserModule,
  ],
})
class AppRootModule {}

describe('MonkModule forRootAsync', () => {
  it('', async () => {
    jest.setTimeout(1000000);

    const module = await NestFactory.createApplicationContext(
      AppRootModule,
      { logger: false },
    );

    const manager = module.get(MONK_MANAGER_TOKEN);
    const userService = module.get(UserService);
    const todoService = module.get(TodoService);
    console.log({manager, userService, todoService, 'User': User });

    await module.get(MongoServer).stopServer();
    expect(module).toBeDefined();
    expect(manager).toBeDefined();
  })
});
