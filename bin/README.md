### Deploy scripts for vpc stack
cdk synth --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectVPCStack
cdk deploy --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectVPCStack

### Deploy scripts for ecr stack
cdk synth --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectECRStack
cdk deploy --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectECRStack

### Deploy scripts for ecs cluster
cdk synth --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectECSClusterStack
cdk deploy --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectECSClusterStack

### Deploy scripts for ecs fargate
cdk synth --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectECSFargateStack
cdk deploy --app "npx ts-node bin/ecs-fargate-stack.ts" BootcampProjectECSFargateStack