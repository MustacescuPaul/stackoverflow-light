import * as cdk from "aws-cdk-lib";
import {
  AccessLogField,
  AccessLogFormat,
  Cors,
  Deployment,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi,
  Stage,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import path = require("path");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StackoverflowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, "StackOverflowTable", {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: AttributeType.STRING },
    });

    const createQuestion = new NodejsFunction(this, "CreateQuestion", {
      entry: path.join(__dirname, "../lambdas/create-question/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
    });

    const getQuestion = new NodejsFunction(this, "GetQuestion", {
      entry: path.join(__dirname, "../lambdas/get-question/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
    });

    const getQuestions = new NodejsFunction(this, "GetQuestions", {
      entry: path.join(__dirname, "../lambdas/get-questions/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
    });

    const createAnswer = new NodejsFunction(this, "CreateAnswer", {
      entry: path.join(__dirname, "../lambdas/create-answer/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
    });

    const createVotes = new NodejsFunction(this, "CreateVotes", {
      entry: path.join(__dirname, "../lambdas/create-votes/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
    });

    const getAnalytics = new NodejsFunction(this, "getAnalytics", {
      entry: path.join(__dirname, "../lambdas/get-analytics/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
    });

    const stackOverflowApi = new RestApi(this, "StackOverflowApi", {
      description: "The StacOverflow API",
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Access-Control-Allow-Origin",
          "Content-Type",
          "Field-Authorisation",
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Credentials",
          "Authorization",
        ],
        allowMethods: Cors.ALL_METHODS,
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });

    const questionsPath = stackOverflowApi.root.addResource("questions");
    const questionPath = questionsPath.addResource("{questionId}");
    const answersPath = stackOverflowApi.root.addResource("answers");
    const votesPath = stackOverflowApi.root.addResource("votes");
    const analyticsPath = stackOverflowApi.root.addResource("analytics");

    questionsPath.addMethod("POST", new LambdaIntegration(createQuestion));
    questionsPath.addMethod("GET", new LambdaIntegration(getQuestions));
    questionPath.addMethod("GET", new LambdaIntegration(getQuestion));
    answersPath.addMethod("POST", new LambdaIntegration(createAnswer));
    votesPath.addMethod("POST", new LambdaIntegration(createVotes));
    analyticsPath.addMethod("GET", new LambdaIntegration(getAnalytics));

    const deployment = new Deployment(this, "stackOverflowApiDeployment", {
      api: stackOverflowApi,
    });

    new Stage(this, `v1`, { deployment, stageName: "v1" });
  }
}
