import { ConfigService } from '@nestjs/config';
import {
  DeleteResult,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

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
      throw new HttpException('Could not find object', HttpStatus.NOT_FOUND);
    }

    return entity;
  }

  async deleteFromProprety(
    findOptsWhere: FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    const entity = await this.findEntry(findOptsWhere);

    return await this.deleteEntry(entity);
  }

  async deleteEntry(entity: T) {
    return await this.repository.delete(entity);
  }

  async saveItem(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }
}
