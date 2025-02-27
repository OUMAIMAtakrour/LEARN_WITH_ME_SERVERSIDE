import { Inject, Module } from '@nestjs/common';

import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { config } from 'process';
import config from './config/config';
import { join } from 'path';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],//kdshvbsfsd
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,

      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    CoursesModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
