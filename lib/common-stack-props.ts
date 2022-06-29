import { StackProps, aws_ecr } from 'aws-cdk-lib';

export interface CommonStackProps extends StackProps {
  ecrStack: aws_ecr.Repository;
}
