import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('bsc_transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 66 })
  @Index()
  hash: string;

  @Column('bigint')
  blockNumber: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ length: 42 })
  @Index()
  fromAddress: string;

  @Column({ length: 42 })
  @Index()
  toAddress: string;

  @Column('decimal', { precision: 65, scale: 18 })
  value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}