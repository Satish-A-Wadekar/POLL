import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4(); // Auto-generated UUID

  @Column()
  question: string;

  @Column('simple-json')
  options: { text: string; votes: number }[];

  @Column('simple-json', { default: '[]' })
  votedUsers: string[];

  @Column('datetime')
  expiryDate: Date;

  @Column({ default: false })
  isExpired: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  updateIsExpired() {
    this.isExpired = new Date() >= new Date(this.expiryDate);
  }
}
