import { RemovalPolicy, Stack, StackProps, CfnOutput, Fn, aws_cloud9, aws_ssm } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_ec2,
  aws_s3,
  aws_ecs,
  aws_iam,
  aws_elasticloadbalancingv2,
  aws_certificatemanager,
  aws_route53,
  aws_route53_targets,
  aws_cloudwatch
} from 'aws-cdk-lib';
import { CommonStackProps } from '../common-stack-props';
import { getConfig } from '../config';

export class ECSFargateStack extends Stack {
  constructor(scope: Construct, id: string, props?: CommonStackProps) {
    super(scope, id, props);

    const conf = getConfig(scope);

    if (props?.ecrStack) {

      const vpc = aws_ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
        vpcId: conf.vpcId,
        availabilityZones: conf.availabilityZones,
        publicSubnetIds: conf.publicSubnetIds,
      });

      const clusterSg = aws_ec2.SecurityGroup.fromSecurityGroupId(this, 'BootcampProjectECSClusterSg', Fn.importValue('BootcampProjectECSClusterSgId'));

      const cluster = aws_ecs.Cluster.fromClusterAttributes(this, 'BootcampProjectECSCluster', {
        clusterArn: Fn.importValue('BootcampProjectECSClusterARN'),
        clusterName: Fn.importValue('BootcampProjectECSClusterName'),
        vpc,
        securityGroups: [clusterSg]
      });

      const executionRole = new aws_iam.Role(this, 'BootcampProjectBackendFargateServiceIAMRole', {
        roleName: 'BootcampProjectBackendFargateServiceIAMRole',
        assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      });

      executionRole.addToPolicy(new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: [ '*' ],
        actions: [
          "ssm:Describe*",
          "ssm:Get*",
          "ssm:List*"
        ]
      }));

      const taskDef = new aws_ecs.FargateTaskDefinition(this, 'BootcampProjectBackendFargateServiceTaskDef', {
        family: 'BootcampProjectBackendFargateServiceTaskDef',
        cpu: 1024,
        memoryLimitMiB: 2048,
        executionRole,
      });

      taskDef.addContainer('BootcampProjectBackendServiceContainer', {
        containerName: 'bootcamp-project',
        image: aws_ecs.ContainerImage.fromEcrRepository(props.ecrStack, 'latest'), 
        memoryReservationMiB: 1024,
        portMappings: [
          {
            containerPort: 8080,
          }
        ],
        environment: {
          DB_PASSWORD: aws_ssm.StringParameter.fromStringParameterName(this, '/app/DB_PASSWORD', '/app/DB_PASSWORD' ).stringValue,
          JWT: aws_ssm.StringParameter.fromStringParameterName(this, '/bootcampProject/JWT', '/bootcampProject/JWT' ).stringValue,
          DB_URL: aws_ssm.StringParameter.fromStringParameterName(this, '/bootcampProject/DB_URL', '/bootcampProject/DB_URL' ).stringValue
        }
      });

      const serviceSg = new aws_ec2.SecurityGroup(this, 'BootcampProjectBackendECSFargateSecurityGroup', {
        vpc,
        allowAllOutbound: true,
        securityGroupName: 'bootcamp-project-backend-ecs-farget-sg'
      });

      const service = new aws_ecs.FargateService(this, 'BootcampProjectBackendFargateService', {
        serviceName: 'bootcamp-project-backend-service',
        cluster,
        taskDefinition: taskDef,
        desiredCount: 2,
        securityGroups: [serviceSg],
        assignPublicIp: true,
      });

      const autoscale = service.autoScaleTaskCount({
        minCapacity: 1,
        maxCapacity: 4,
      });

      const albSg = new aws_ec2.SecurityGroup(this, 'ALBsg', {
        securityGroupName: 'bootcamp-project-alb-sg',
        vpc,
        allowAllOutbound: true,
      });

      albSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(80), 'allow access from anywhere to http port');
      albSg.addIngressRule(aws_ec2.Peer.anyIpv4(), aws_ec2.Port.tcp(443), 'allow access from anywhere to https port');

      serviceSg.addIngressRule(albSg, aws_ec2.Port.tcpRange(49153, 65535), 'allow access container ports from ALB');

      const serviceAlb = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'BootcampProjectBackendALB', {
        loadBalancerName: 'bootcamp-project-alb',
        vpc,
        internetFacing: true,
        securityGroup: albSg,
        deletionProtection: true,
      });

      const serviceTargetGroup = new aws_elasticloadbalancingv2.ApplicationTargetGroup(this, 'ServiceTargetGroup', {
        healthCheck: {
          enabled: true,
          path: '/',
          port: '8080',
          protocol: aws_elasticloadbalancingv2.Protocol.HTTP,
          healthyHttpCodes: '200',
        },
        port: 80,
        protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
        targetGroupName: 'bootcamp-project-backend-tg',
        targetType: aws_elasticloadbalancingv2.TargetType.IP,
        targets: [service],
        vpc,
      });

      const httpListenerAction = aws_elasticloadbalancingv2.ListenerAction.redirect({
        host: '#{host}',
        path: '/#{path}',
        port: '443',
        protocol: 'HTTPS',
        permanent: true,
      });
      serviceAlb.addListener('httpListener', {
        port: 80,
        protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTP,
        defaultAction: httpListenerAction
      });

      const certificate = aws_certificatemanager.Certificate.fromCertificateArn(this, 'BootcampProjectBackendCert', 'arn:aws:acm:eu-central-1:798955582832:certificate/88397df2-0f02-4c17-9020-97d0a7dfee9c');

      serviceAlb.addListener('httpsListener', {
        port: 443,
        protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTPS,
        defaultTargetGroups: [serviceTargetGroup],
        certificates: [certificate]
      });

      autoscale.scaleOnRequestCount('scaleOnTargetGroup', {
        requestsPerTarget: 10,
        targetGroup: serviceTargetGroup,
      });

      const hostedZone = aws_route53.HostedZone.fromHostedZoneAttributes(this, 'BootcampProjectHostedZone', {
        hostedZoneId: 'Z0382000F8AKQCUV1BHR', //insert your hosted zone ID here.
        zoneName: 'erenyigit.com'
      });

      const target = new aws_route53_targets.LoadBalancerTarget(serviceAlb);
    
      new aws_route53.ARecord(this, 'BootcampProjectBackendARecord', {
        target: aws_route53.RecordTarget.fromAlias(target),
        zone: hostedZone,
        recordName: 'bootcampproject'
      });

    }

  }
}
