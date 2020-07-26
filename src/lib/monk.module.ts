import { Module, DynamicModule, FactoryProvider } from '@nestjs/common';
import monk, { IMonkManager, ICollection } from 'monk';
import { MONK_MANAGER_TOKEN, MONK_DATABASE_TOKEN, MONK_OPTIONS_TOKEN, createMonkCollectionToken } from './tokens';
import { MonkOptions, AsyncProvider, ImportableFactoryProvider } from './types';

export interface CollectionProviderOptions<T> {
  collectionName: string;
  collectionOptions?: (collection: ICollection<T>) => void;
}

export class FakeMonk {
  constructor(
    readonly database: any,
    readonly options: any,
  ) {
  }
}

export class FakeCollection {
  constructor(
    readonly data: any,
  ) {
  }
}

@Module({})
export class MonkModule {
  static forRoot(moduleOptions: {
    database: string | Array<string>,
    collections?: Array<string | CollectionProviderOptions<any>>,
    options?: MonkOptions,
  }): DynamicModule {
    return this.forRootAsync({
      database: {
        useValue: moduleOptions.database,
      },
      collections: moduleOptions?.collections?.length
        ? moduleOptions.collections
        : null,
      options: moduleOptions.options 
        ? { useValue: moduleOptions.options }
        : null,
    });
  }

  static forRootAsync(moduleOptions: {
    database: AsyncProvider<string | Array<string> | Promise<string> | Promise<Array<string>>>,
    collections?: Array<string | CollectionProviderOptions<any>>,
    options?: AsyncProvider<MonkOptions>,
  }): DynamicModule {
    const module: DynamicModule = {
      global: true,
      module: MonkModule,
      imports: [],
      providers: [
        {
          provide: MONK_MANAGER_TOKEN,
          useFactory: async (
            database: string | Array<string>,
            options: MonkOptions,
          ) => {
            // const monk2 = await monk(database, {
            //   connectTimeoutMS: 5000,
            //   socketTimeoutMS: 5000,
            // });
            return Promise.resolve(
              new FakeMonk(database, options),
            );
          },
          inject: [
            MONK_DATABASE_TOKEN, 
            MONK_OPTIONS_TOKEN,
          ],
        }
      ],
      exports: [MONK_MANAGER_TOKEN],
    };

    const addAsyncProvider = <T>(provide: string, defaultValue: T, asyncProvider: AsyncProvider<T>) => {
      if (!asyncProvider) {
        module.providers.push({
          provide,
          useValue: defaultValue,
        });
        return;
      }

      const imports = (asyncProvider as ImportableFactoryProvider<MonkOptions>).imports;
      if (imports?.length) {
        imports.forEach(i => module.imports.push(i));
      }
      delete (asyncProvider as ImportableFactoryProvider<MonkOptions>).imports;

      module.providers.push({
        ...asyncProvider,
        provide,
      });
    };

    addAsyncProvider(MONK_DATABASE_TOKEN, '', moduleOptions.database);
    addAsyncProvider(MONK_OPTIONS_TOKEN, {}, moduleOptions.options);

    this.createCollectionProviders(moduleOptions?.collections).forEach(cp => {
      module.providers.push(cp);
    });

    return module;
  }

  static forFeatures(
    collections?: Array<string | CollectionProviderOptions<any>>,
  ): DynamicModule {
    const module: DynamicModule = {
      module: MonkModule,
      imports: [],
      providers: [],
      exports: [],
    };

    this.createCollectionProviders(collections).forEach(cp => {
      module.providers.push(cp);
      module.exports.push(cp.provide);
    });

    return module;
  }

  private static createCollectionProviders = (
    collections?: Array<string | CollectionProviderOptions<any>>,
  ): FactoryProvider<ICollection<any>>[] => {
    const createCollectionProvider = <T>(options: CollectionProviderOptions<T>): FactoryProvider<ICollection<T>> => {
      return {
        provide: createMonkCollectionToken(options.collectionName),
        useFactory: (
          monkManager: IMonkManager
        ) => {
          // const collection = monkManager.get(options.collectionName);
          // if (options?.collectionOptions) {
          //   options.collectionOptions(collection);
          // }
          // return collection;
          return new FakeCollection(null) as any;
        },
        inject: [
          MONK_MANAGER_TOKEN,
        ],
      };
    };

    return (collections ?? []).map(collection => {
      return createCollectionProvider(
        typeof collection === 'string'
        ? { collectionName: collection }
        : collection);
    });
  };
}
