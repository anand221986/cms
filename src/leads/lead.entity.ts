// lead.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ default: 'new' })
  status: string; // new, contacted, in-progress, closed, lost

  @Column({ nullable: true })
  assignedTo: string; // user id or name

  @Column({ nullable: true })
  message: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
