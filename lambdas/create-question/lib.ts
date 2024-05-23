import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 } from "uuid";
import { Question, QuestionDBItem, QuestionQuery } from "../../shared/types";
import { getEnvVar } from "../../shared/utils";
import { getQuestion } from "../../shared/aws/dynamo";

export const mapCreateQuestionQuery = (
  question: Question,
  userId: string,
  questionId: string,
): QuestionQuery => {
  const pk = `QUESTION#${questionId}`;
  const sortKey = `QUESTION#${questionId}`;

  const gsi1Pk = `USER#${userId}`;
  const gsi1Sk = `QUESTION#${questionId}`;

  const gsi2Pk = `QUESTION`;
  const gsi2Sk = `${Date.now()}`;

  return {
    PK: pk,
    SK: sortKey,
    GSI1PK: gsi1Pk,
    GSI1SK: gsi1Sk,
    GSI2PK: gsi2Pk,
    GSI2SK: gsi2Sk,
    ...question,
  };
};

export const createQuestion = async (
  question: Question,
  userId: string,
): Promise<QuestionDBItem | undefined> => {
  const questionId = v4();
  const item = mapCreateQuestionQuery(question, userId, questionId);

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
    console.log("Success, question created: ", response);
  } catch (err) {
    console.log("Error creating question", err);
    throw err;
  }

  try {
    const question = await getQuestion(questionId);
    return question;
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
};
