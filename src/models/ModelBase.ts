import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class ModelBsae {
  @PrimaryGeneratedColumn()
  id: number;
}
