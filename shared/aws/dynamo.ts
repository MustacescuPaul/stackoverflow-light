import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { getEnvVar } from "../utils";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { QuestionDBItem } from "../types";

export const getQuestion = async (
  questionId: string,
): Promise<QuestionDBItem | undefined> => {
  console.log(`Geting question`);

  const item: QueryCommandInput = {
    TableName: getEnvVar("tableName"),
    ExpressionAttributeValues: {
      ":pk": { S: `QUESTION#${questionId}` },
      ":sk": { S: `QUESTION#${questionId}` },
    },
    KeyConditionExpression: `PK = :pk AND SK = :sk`,
  };

  const client = new DynamoDBClient({
    region: "eu-west-2",
  });

  console.log(`Retrieving question ${JSON.stringify(item)}`);

  const response = await client.send(new QueryCommand(item));

  if (!response.Items || response.Items.length === 0) {
    return undefined;
  }

  if (response.Items.length > 1) {
    console.log("DUPLICATE question id found!");
  }

  return unmarshall(response.Items[0]) as QuestionDBItem;
};
