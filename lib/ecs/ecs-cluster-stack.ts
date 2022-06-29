import { RemovalPolicy, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_ecs,
  aws_ec2,
} from 'aws-cdk-lib';
import { getConfig } from '../config';

export class BootcampProjectECSClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const conf = getConfig(scope);

    const vpc = aws_ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: conf.vpcId,
      availabilityZones: conf.availabilityZones,
      publicSubnetIds: conf.publicSubnetIds,
    });

    const cluster = new aws_ecs.Cluster(this, 'BootcampProjectECSCluster', {
      clusterName: 'bootcamp-project-cluster',
      vpc,
    });

    const clusterSg = new aws_ec2.SecurityGroup(this, 'BootcampProjectECSClusterSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'bootcamp-project-ecs-cluster-sg'
    });

    clusterSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(80), 'allow access from anywhere to http port');
    clusterSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(443), 'allow access from anywhere to https port');

    cluster.connections.addSecurityGroup();

    new CfnOutput(this, 'BootcampProjectECSClusterARN', {
      exportName: 'BootcampProjectECSClusterARN',
      value: cluster.clusterArn
    });

    new CfnOutput(this, 'BootcampProjectECSClusterName', {
      exportName: 'BootcampProjectECSClusterName',
      value: cluster.clusterName
    });

    new CfnOutput(this, 'BootcampProjectECSClusterSgId', {
      exportName: 'BootcampProjectECSClusterSgId',
      value: clusterSg.securityGroupId
    });

  }
}
