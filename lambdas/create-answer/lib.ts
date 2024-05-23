import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 } from "uuid";
import { AnswerQuery, AnswerRequest } from "../../shared/types";
import { getEnvVar } from "../../shared/utils";

export const mapCreateAnswerQuery = (
  answer: AnswerRequest["answer"],
  userId: string,
  answerId: string,
  questionId: string,
): AnswerQuery => {
  const pk = `QUESTION#${questionId}`;
  const sortKey = `ANSWER#${answerId}`;

  const gsi1Pk = `USER#${userId}`;
  const gsi1Sk = `ANSWER#${answerId}`;

  const gsi2Pk = `ANSWER`;
  const gsi2Sk = `${Date.now()}`;

  return {
    PK: pk,
    SK: sortKey,
    GSI1PK: gsi1Pk,
    GSI1SK: gsi1Sk,
    GSI2PK: gsi2Pk,
    GSI2SK: gsi2Sk,
    body: answer.body,
  };
};

export const createAnswer = async (
  answer: AnswerRequest["answer"],
  questionId: string,
  userId: string,
): Promise<PutItemCommandOutput> => {
  const answerId = v4();
  const item = mapCreateAnswerQuery(answer, userId, answerId, questionId);

  const client = new DynamoDBClient({
    region: "eu-west-2",
  });

  try {
    const response = await client.send(
      new PutItemCommand({
        TableName: getEnvVar("tableName"),
        Item: marshall(item),
      }),
    );
    console.log("Success, answer created: ", response);
    return response;
  } catch (err) {
    console.log("Error creating answer", err);
    throw err;
  }
};
