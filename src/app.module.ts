import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [
    /** module here */
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
