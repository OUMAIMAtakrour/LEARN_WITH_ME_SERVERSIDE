import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Certificate {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
