import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
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
}

/*@Entity()
export class Poll {
  @PrimaryGeneratedColumn()
  id: string = uuidv4(); // Auto-generated UUID

  @Column()
  question: string;

  @Column('simple-json')
  options: { text: string; votes: number }[] = [];
  //options: { text: string; votes: number }[];

  @Column('simple-json')
  votedUsers: string[] = [];

  @Column()
  expiryDate: Date;

  @Column({ default: false })
  isExpired: boolean;

  
  @Column('simple-json', { nullable: true })
  votedSockets?: string[]; // Track which sockets have voted

  //@Column('simple-json', { nullable: true })
  //votedUsers?: string[]; // Track which users have voted

  @Column({ nullable: true })
  creatorSocketId?: string;

  @Column()
  creatorId: string;
  
}*/
