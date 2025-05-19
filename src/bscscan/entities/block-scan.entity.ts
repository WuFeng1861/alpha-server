import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('block_scan_state')
export class BlockScanState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  lastScannedBlock: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastScanTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}