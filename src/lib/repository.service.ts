import { ICollection } from 'monk';

export class Repository<T> {
  constructor(
    private readonly collection: ICollection<T>,
  ) {
  }

  getById(id: string) {
    return this.collection.findOne({ _id: id });
  }

  list(query: string | Object) {
    return this.collection.find(query);
  }

  add(entity: T) {
    return this.collection.insert(entity);
  }

  delete(id: string) {
    return this.collection.remove({ _id: id })
  }

  edit(id: string, entity: T) {
    return this.collection.findOneAndUpdate({ _id: id}, entity)
  }
}