#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BootcampProjectVPCStack } from '../lib/vpc';
import { getConfig } from '../lib/config';

const app = new cdk.App();
const conf = getConfig(app);
const env = {
  account: conf.account,
  region: conf.region,
};

new BootcampProjectVPCStack(app, 'BootcampProjectVPCStack', { env });
