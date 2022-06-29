#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getConfig } from '../lib/config';
import { BootcampProjectECSClusterStack } from '../lib/ecs';
import { BootcampProjectECRStack } from '../lib/ecr';
import { ECSFargateStack } from '../lib/ecs';

const app = new cdk.App();
const conf = getConfig(app);
const env = {
  account: conf.account,
  region: conf.region,
};

new BootcampProjectECSClusterStack(app, 'BootcampProjectECSClusterStack', { env });
const ecrStack = new BootcampProjectECRStack(app, 'BootcampProjectECRStack', { env });
new ECSFargateStack(app, 'BootcampProjectECSFargateStack', { ecrStack: ecrStack.ecrRepo });
