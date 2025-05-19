import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('user_bnb_balances')
export class UserBnbBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 42 })
  @Index()
  address: string;

  @Column('decimal', { precision: 65, scale: 18 })
  balance: number;

  @Column('bigint')
  @Index()
  blockNumber: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}