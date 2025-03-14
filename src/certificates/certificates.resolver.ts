import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CertificatesService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateInput } from './dto/create-certificate.input';
import { UpdateCertificateInput } from './dto/update-certificate.input';

@Resolver(() => Certificate)
export class CertificatesResolver {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Mutation(() => Certificate)
  createCertificate(@Args('createCertificateInput') createCertificateInput: CreateCertificateInput) {
    return this.certificatesService.create(createCertificateInput);
  }

  @Query(() => [Certificate], { name: 'certificates' })
  findAll() {
    return this.certificatesService.findAll();
  }

  @Query(() => Certificate, { name: 'certificate' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.certificatesService.findOne(id);
  }

  @Mutation(() => Certificate)
  updateCertificate(@Args('updateCertificateInput') updateCertificateInput: UpdateCertificateInput) {
    return this.certificatesService.update(updateCertificateInput.id, updateCertificateInput);
  }

  @Mutation(() => Certificate)
  removeCertificate(@Args('id', { type: () => Int }) id: number) {
    return this.certificatesService.remove(id);
  }
}
