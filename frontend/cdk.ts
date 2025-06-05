#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from './stacks/FrontendStack';

const app = new cdk.App();

new FrontendStack(app, 'FrontendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
  },
});
