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

## How to test this application

Once the project is deployed, you will need to fetch the following and add them to `shared/testing/utils`:

- API Gateway base URL from `Outputs`
- Client secret, client id and domain from the `User Pool Client` in AWS Cognito
  These would normally live in AWS Secrets Manager / .env

## Testing

I added a couple of unit tests on the more important pieces of code but I avoided testing the methods that use AWS SDK as they are pretty straight forward and to avoid having to spend time with mocking the AWS SDK methods. I would have reconsidered this if I had more time.

I added integration tests for all the endpoints.

## API versioning

This project leverages API Gateway Stages for versioning. It is currently deploying to the `v1` stage.

## Functionalities

I didn't get a chance to implement:

- Analytics
- Get number of votes and andswers on the list of questions
- Vote functionality
- WebSockets for duplex communication

## Database choice

The choice for DynamoDB is quite debatable given the time constraints.I chose to go with this choice mainly for 2 reasons:

- This is what I use every day at work
- I really wanted to showcase the single table design :D

Otherwise I would have made a very different choice of DB for this particular project.

## Caching

I wanted to leverage DynamoDB DAX for caching but by the time I got to implement that, I realised there is no L2 construct available in CDK from AWS for DAX. This means it would take some extra time to implement using the L1 construct.

## Authorization

I gave it a try to implement OpenID connect with AWS Cognito and got quite far into it but had to abandon it as my experience is quite limited with that. I went for a different approach using oauth 2.0 client credentials grant and passing in the userId from the client (this works on the assumption that the client can provide and maintain user authentication)
If I had more time I would have chosen either all the way with OpenID or a basic email and password signIn/signUp with AWS Cognito user pools.

## OpenAPI

The OpenAPI documentation is available in the `StackOverflowApi-v1-oas30.yaml` file.

## Process diagram

![Alt text](process-diagram.png?raw=true "Process diagram")

## Database design

![Alt text](table-design.png?raw=true "Table design")

## Architecture diagram

![Alt text](architecture-diagram.png?raw=true "Architecture diagram")
