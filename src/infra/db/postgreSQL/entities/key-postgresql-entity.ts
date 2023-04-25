import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatEntity } from "./chat-postgresql-entity";

@Entity({ name: "key" })
export class KeyEntity {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @PrimaryColumn()
  public userId!: string;

  @OneToOne(() => ChatEntity, { cascade: true })
  @JoinColumn()
  public chat: ChatEntity;

  @Column({ unique: true })
  public key!: string;
}
