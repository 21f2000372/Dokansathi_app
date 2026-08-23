import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787499002824 implements MigrationInterface {
    name = 'InitialSchema1787499002824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventories" ("inventoryId" character varying(50) NOT NULL, CONSTRAINT "PK_79fa97e66bebd5549e4be0c11ef" PRIMARY KEY ("inventoryId"))`);
        await queryRunner.query(`CREATE TABLE "products" ("productId" character varying(50) NOT NULL, "name" character varying(150) NOT NULL, "category" character varying(100) NOT NULL, "price" numeric(10,2) NOT NULL, "stockQuantity" integer NOT NULL DEFAULT '0', "unit" character varying(30) NOT NULL, "inventoryInventoryId" character varying(50), CONSTRAINT "PK_7b3b507508cd0f86a5b2e923459" PRIMARY KEY ("productId"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("itemId" character varying(50) NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "orderOrderId" character varying(50) NOT NULL, "productProductId" character varying(50) NOT NULL, CONSTRAINT "PK_e253fbd572683bcc785a70cbca7" PRIMARY KEY ("itemId"))`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('assigned', 'in-progress', 'completed')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("taskId" character varying(50) NOT NULL, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'assigned', "assignedAt" TIMESTAMP, "orderOrderId" character varying(50) NOT NULL, "assistantUserId" character varying(50) NOT NULL, CONSTRAINT "PK_514623383bc4d768101bcf69462" PRIMARY KEY ("taskId"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('cash', 'upi', 'card')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "payments" ("paymentId" character varying(50) NOT NULL, "amount" numeric(10,2) NOT NULL, "method" "public"."payments_method_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_ae0b0903f275c81d8a2a45ce3b5" PRIMARY KEY ("paymentId"))`);
        await queryRunner.query(`CREATE TABLE "bills" ("billId" character varying(50) NOT NULL, "amount" numeric(10,2) NOT NULL, "generatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orderOrderId" character varying(50) NOT NULL, CONSTRAINT "REL_31ac19874a9f599f1000220a6a" UNIQUE ("orderOrderId"), CONSTRAINT "PK_37fa151d8f716a1b3bb9e7c5fab" PRIMARY KEY ("billId"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("notificationId" character varying(50) NOT NULL, "message" text NOT NULL, "sentAt" TIMESTAMP NOT NULL DEFAULT now(), "orderOrderId" character varying(50) NOT NULL, "recipientUserId" character varying(50) NOT NULL, CONSTRAINT "PK_b39089dc8ff57d2bc507f08e52b" PRIMARY KEY ("notificationId"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'in-progress', 'ready', 'billed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("orderId" character varying(50) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "totalAmount" numeric(10,2) NOT NULL DEFAULT '0', "queuePosition" integer, "customerUserId" character varying(50) NOT NULL, CONSTRAINT "PK_41ba27842ac1a2c24817ca59eaa" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'shop_owner', 'assistant')`);
        await queryRunner.query(`CREATE TABLE "users" ("userId" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "phone" character varying(15) NOT NULL, "email" character varying(150) NOT NULL, "passwordHash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "loyaltyPoints" integer NOT NULL DEFAULT '0', "availabilityStatus" character varying(20), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_b43aca884974bac4ae4d35cabaa" FOREIGN KEY ("inventoryInventoryId") REFERENCES "inventories"("inventoryId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_7fdb8279503d87a8b6a1880e3d4" FOREIGN KEY ("orderOrderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_28bedaa57c26b26f953d27d8df0" FOREIGN KEY ("productProductId") REFERENCES "products"("productId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_f3db1395664bb943713f337c489" FOREIGN KEY ("orderOrderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_09a5fd6b649384ec5b6be599535" FOREIGN KEY ("assistantUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bills" ADD CONSTRAINT "FK_31ac19874a9f599f1000220a6a9" FOREIGN KEY ("orderOrderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_8df04555a97f8ad7a8ef5f8695a" FOREIGN KEY ("orderOrderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_0be815cabd15a62a5546a4b1357" FOREIGN KEY ("recipientUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_d00d5293164f73c78404222d817" FOREIGN KEY ("customerUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_d00d5293164f73c78404222d817"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_0be815cabd15a62a5546a4b1357"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_8df04555a97f8ad7a8ef5f8695a"`);
        await queryRunner.query(`ALTER TABLE "bills" DROP CONSTRAINT "FK_31ac19874a9f599f1000220a6a9"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_09a5fd6b649384ec5b6be599535"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_f3db1395664bb943713f337c489"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_28bedaa57c26b26f953d27d8df0"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_7fdb8279503d87a8b6a1880e3d4"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_b43aca884974bac4ae4d35cabaa"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "bills"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "inventories"`);
    }

}
