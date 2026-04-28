import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateQuestionDomainDto } from './dto/create-question.domain.dto';
import { randomUUID } from 'crypto';
import { UpdateQuestionInputDto } from '../api/input-dto/update-question.input-dto';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public body: string;

  @Column({ type: 'varchar', name: 'correct_answers' })
  public correctAnswers: string[];

  @Column({ type: 'boolean' })
  public published: boolean;

  @Column({ type: 'timestamp without time zone', name: 'created_at' })
  public createdAt: Date;

  @Column({ type: 'timestamp without time zone', name: 'updated_at' })
  public updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    name: 'deleted_at',
  })
  public deletedAt: Date | null;

  static createInstance(dto: CreateQuestionDomainDto): Question {
    const question = new Question();
    question.id = randomUUID();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;
    question.createdAt = new Date();
    question.updatedAt = new Date();
    question.deletedAt = null;
    return question;
  }
  update(dto: UpdateQuestionInputDto): void {
    this.body = dto.body || this.body;
    this.correctAnswers = dto.correctAnswers || this.correctAnswers;
    this.published = dto.published || this.published;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  makePublished(): void {
    if (this.published) {
      throw new Error('Entity already published');
    }
    this.published = true;
  }
}
