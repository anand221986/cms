// lead-activity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class LeadActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leadId: number;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
