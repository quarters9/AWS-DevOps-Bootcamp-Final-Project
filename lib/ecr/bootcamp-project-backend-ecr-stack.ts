import { RemovalPolicy, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_ecr
} from 'aws-cdk-lib';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as ecrdeploy from 'cdk-ecr-deployment';

export class BootcampProjectECRStack extends Stack {

  ecrRepo: aws_ecr.Repository;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.ecrRepo = new aws_ecr.Repository(this, 'BootcampProjectECRRepository', {
      repositoryName: 'bootcamp-project',
      removalPolicy: RemovalPolicy.RETAIN,
    });


    new CfnOutput(this, 'BootcampProjectECRRepositoryARN', {
      exportName: 'BootcampProjectECRRepositoryARN',
      value: this.ecrRepo.repositoryArn,
    });
    
    
  }
}
