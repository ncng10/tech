import { Migration } from '@mikro-orm/migrations';

export class Migration20201126092014 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email" text null;');
  }

}
