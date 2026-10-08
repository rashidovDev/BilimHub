import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import type { Relation } from 'typeorm';

@Entity('refresh_sessions')
export class RefreshSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tokenHash: string;

  @Column({nullable:true})
  familyId: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true, type : 'timestamp'})
  revokedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date; 

   @ManyToOne(() => User, (user) => user.refreshSessions, {
    onDelete: 'CASCADE',
  })
  user!:  Relation<User>;
}