import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../images/image.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ unique: true })
  folderId: string;

  @Column({ type: 'varchar', nullable: true })
  coverImage: string | null;

  @OneToMany(() => Image, (image) => image.album)
  images: Image[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
