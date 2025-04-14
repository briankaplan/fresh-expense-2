import { Module } from '@nestjs/common';
import { TransactionEditorService } from './transaction-editor.service';
import { MongoDBModule } from '../database/mongodb.module';

@Module({
  imports: [MongoDBModule],
  providers: [TransactionEditorService],
  exports: [TransactionEditorService]
})
export class TransactionEditorModule {} 