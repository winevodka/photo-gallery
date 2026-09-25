import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Album } from '../albums/album.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Album, (album) => album.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'albumId' })
  album: Album;

  @Column()
  @Index()
  albumId: string;

  @Column({ unique: true })
  driveFileId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  takenDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
