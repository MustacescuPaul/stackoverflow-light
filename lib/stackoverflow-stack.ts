import * as cdk from "aws-cdk-lib";
import {
  AccessLogField,
  AccessLogFormat,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  Deployment,
  LambdaIntegration,
  LogGroupLogDestination,
  RestApi,
  Stage,
} from "aws-cdk-lib/aws-apigateway";
import {
  OAuthScope,
  ProviderAttribute,
  ResourceServerScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
} from "aws-cdk-lib/aws-cognito";
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
    const userPool = new UserPool(this, "StackOverflowUserPool");

    const userPoolDomain = userPool.addDomain("StackOverflowDomainName", {
      cognitoDomain: {
        domainPrefix: `stackoverflow-light-xyz-auth-api`,
      },
    });

    const appScope = new ResourceServerScope({
      scopeName: "app",
      scopeDescription: "App scope for StackOverflow App",
    });

    const resourceServer = userPool.addResourceServer("ResourceServer", {
      userPoolResourceServerName: "stack-overflow-resource-server",
      identifier: "stack-overflow-resource-server",
      scopes: [appScope],
    });

    const oauthAppScope = OAuthScope.resourceServer(resourceServer, appScope);

    const poolClient = userPool.addClient("stack-overflow-app-client", {
      userPoolClientName: "StackOverflowAppClient",
      idTokenValidity: cdk.Duration.days(1),
      accessTokenValidity: cdk.Duration.days(1),
      authFlows: {
        userPassword: false,
        userSrp: false,
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: false,
          implicitCodeGrant: false,
          clientCredentials: true,
        },
        scopes: [oauthAppScope],
      },
      preventUserExistenceErrors: true,
      generateSecret: true,
    });

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
      environment: {
        tableName: table.tableName,
      },
    });
    table.grantReadWriteData(createQuestion);

    const getQuestion = new NodejsFunction(this, "GetQuestion", {
      entry: path.join(__dirname, "../lambdas/get-question/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
      environment: {
        tableName: table.tableName,
      },
    });

    table.grantReadData(getQuestion);

    const getQuestions = new NodejsFunction(this, "GetQuestions", {
      entry: path.join(__dirname, "../lambdas/get-questions/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
      environment: {
        tableName: table.tableName,
      },
    });

    table.grantReadData(getQuestions);

    const createAnswer = new NodejsFunction(this, "CreateAnswer", {
      entry: path.join(__dirname, "../lambdas/create-answer/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(60),
      architecture: Architecture.ARM_64,
      environment: {
        tableName: table.tableName,
      },
    });

    table.grantReadWriteData(createAnswer);

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

    const cognitoAuthoriser = new CognitoUserPoolsAuthorizer(
      this,
      "CognitoAuthorizer",
      {
        cognitoUserPools: [userPool],
      },
    );

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

    questionsPath.addMethod("POST", new LambdaIntegration(createQuestion), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
      authorizationScopes: [oauthAppScope.scopeName],
    });
    questionsPath.addMethod("GET", new LambdaIntegration(getQuestions), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
      authorizationScopes: [oauthAppScope.scopeName],
    });
    questionPath.addMethod("GET", new LambdaIntegration(getQuestion), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
      authorizationScopes: [oauthAppScope.scopeName],
    });
    answersPath.addMethod("POST", new LambdaIntegration(createAnswer), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
      authorizationScopes: [oauthAppScope.scopeName],
    });
    votesPath.addMethod("POST", new LambdaIntegration(createVotes), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
      authorizationScopes: [oauthAppScope.scopeName],
    });
    analyticsPath.addMethod("GET", new LambdaIntegration(getAnalytics), {
      authorizer: cognitoAuthoriser,
      authorizationType: AuthorizationType.COGNITO,
      authorizationScopes: [oauthAppScope.scopeName],
    });

    const deployment = new Deployment(this, "stackOverflowApiDeployment", {
      api: stackOverflowApi,
    });

    const v1Stage = new Stage(this, `v1`, { deployment, stageName: "v1" });

    stackOverflowApi.deploymentStage = v1Stage;
    // const userPool = new UserPool(this, "StackOverflowUserPool");
    //
    // const userPoolDomain = userPool.addDomain("StackOverflowDomainName", {
    //   cognitoDomain: {
    //     domainPrefix: `stackoverflow-light-xyz-auth-api`,
    //   },
    // });
    //
    // new UserPoolIdentityProviderGoogle(this, "Google", {
    //   userPool,
    //   clientId:"",
    //   clientSecret: "",
    //
    //   // Email scope is required, because the default is 'profile' and that doesn't allow Cognito
    //   // to fetch the user's email from his Google account after the user does an SSO with Google
    //   scopes: ["email"],
    //
    //   // Map fields from the user's Google profile to Cognito user fields, when the user is auto-provisioned
    //   attributeMapping: {
    //     email: ProviderAttribute.GOOGLE_EMAIL,
    //   },
    // });
    //
    // const callbackUrl = "...";
    //
    // const client = new UserPoolClient(this, "UserPoolClient", {
    //   userPool,
    //   generateSecret: true,
    //   supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
    //   oAuth: {
    //     callbackUrls: [callbackUrl],
    //   },
    // });
  }
}
