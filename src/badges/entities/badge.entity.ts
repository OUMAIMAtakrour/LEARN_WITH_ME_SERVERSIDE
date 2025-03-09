import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Badge {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
