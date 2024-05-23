# Welcome to your Stack Overflow light

This project can be deployed to any AWS account using `cdk deploy`.To do that you will
need CDK installed globally on your machine and AWS credentials configured locally with
AWS CLI.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests and integration tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## Process diagram

![Alt text](process-diagram.png?raw=true "Process diagram")

## Database design

![Alt text](table-design.png?raw=true "Table design")

## Architecture diagram

![Alt text](architecture-diagram.png?raw=true "Architecture diagram")
