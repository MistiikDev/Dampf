import { ConfigService } from '@nestjs/config';
import {
  DeleteResult,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export abstract class GenericService<T extends ObjectLiteral> {
  protected configService: ConfigService;

  protected constructor(private repository: Repository<T>) {
    this.configService = new ConfigService();
  }

  async findAllEntries(): Promise<T[]> {
    return await this.repository.find();
  }

  async findEntry(
    findOptsWhere: FindOptionsWhere<T>,
    findOptsRelations?: FindOptionsRelations<T>,
  ): Promise<T> {
    const entity: T | null = await this.repository.findOne({
      where: findOptsWhere,
      relations: findOptsRelations,
    });

    if (!entity) {
      throw new NotFoundException('Could not find object');
    }

    return entity;
  }

  async deleteFromProprety(
    findOptsWhere: FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    return await this.repository.delete(findOptsWhere);
  }

  async deleteEntry(entity: T) {
    return await this.repository.remove(entity);
  }

  async saveItem(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }
}
