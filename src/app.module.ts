import { Inject, Module } from '@nestjs/common';

import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { config } from 'process';
import config from './config/config';
import { join } from 'path';
import { CoursesModule } from './courses/courses.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-ts';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // uploads: false, 
      introspection: true,
      resolvers:{Upload:GraphQLUpload},

      context: ({ req }) => ({ req }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
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
    FileUploadModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
