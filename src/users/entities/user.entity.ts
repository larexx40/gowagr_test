import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BeforeInsert,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;

    @Column({ nullable: false })
    firstname: string;
  
    @Column({ nullable: false })
    lastname: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column()
    password: string;
  
    @Column({ default: false })
    isVerified: boolean;
  
    @Column({ nullable: true })
    verificationOtp: string;
  
    @Column({ nullable: true })
    refreshToken: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // @BeforeInsert()
    // async hashPassword() {
    //   this.password = await bcrypt.hash(this.password, 10);
    // }
}