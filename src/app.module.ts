import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import { join } from 'path';
import { GraphQLUpload } from 'graphql-upload-ts';
import config from './config/config';
import { CoursesModule } from './courses/courses.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { BadgesModule } from './badges/badges.module';
import { CourseProgressModule } from './course-progress/course-progress.module';
import { CertificatesModule } from './certificates/certificates.module';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      context: ({ req }) => ({ req }),
      resolvers: {
        Upload: GraphQLUpload,
      },
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
    BadgesModule,
    CourseProgressModule,
    CertificatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
