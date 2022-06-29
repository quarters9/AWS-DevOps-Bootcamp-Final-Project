import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_ec2,
} from 'aws-cdk-lib';

export class BootcampProjectVPCStack extends Stack {

  //define which azs resources going to use
  get availabilityZones(): string[] {
    return ['eu-central-1a', 'eu-central-1b']
  }

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new aws_ec2.Vpc(this, 'BootcampProjectVPC', {
      vpcName: 'bootcamp-project-vpc',
      cidr: '10.0.0.0/16',
      natGateways: 1,
      //number of azs
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'publicSubnet',
          subnetType: aws_ec2.SubnetType.PUBLIC,
          cidrMask: 20,
        },
        {
          name: 'privateSubnet',
          //PRIVATE_WITH_NAT creates a private subnet with NAT Gateway
          //PRIVATE_ISOLATED creates a private subnet without an internet access
          //hence without a NAT Gateway
          subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 20,
        }
      ]
    });

  }
}
