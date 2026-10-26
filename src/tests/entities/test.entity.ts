import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TestStatus } from "../enums/test-status.enum.js";
import { TestVisibility } from "../enums/test-visibility.enum.js";

@Entity('tests')
export class Test {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    teacherId: string;

    @Column({
        type : 'enum',
        enum : TestStatus,
        default : TestStatus.DRAFT
    })
    status: TestStatus;

    @Column({
        type : 'enum',
        enum : TestVisibility,
        default : TestVisibility.PRIVATE
    })
    visiblity: TestVisibility;

    @DeleteDateColumn({
  type: 'timestamptz',
  nullable: true,
})
deletedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}