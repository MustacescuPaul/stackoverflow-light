import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { QuestionDBItem } from "../../shared/types";
import { getEnvVar } from "../../shared/utils";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export const getQuestions = async (
  lastEvaluatedKey?: QuestionDBItem,
): Promise<{ lastEvaluatedKey?: string; items: QuestionDBItem[] } | []> => {
  console.log(`Geting questions`);

  const item: QueryCommandInput = {
    TableName: getEnvVar("tableName"),
    IndexName: "GSI2",
    ExpressionAttributeValues: {
      ":pk": { S: `QUESTION` },
    },
    KeyConditionExpression: `GSI2PK = :pk `,
    Limit: 10,
    ...(lastEvaluatedKey && { LastEvaluatedKey: marshall(lastEvaluatedKey) }),
  };

  const client = new DynamoDBClient({
    region: "eu-west-2",
  });

  console.log(`Retrieving question ${JSON.stringify(item)}`);

  const response = await client.send(new QueryCommand(item));

  if (!response.Items || response.Items.length === 0) {
    return [];
  }

  return {
    items: response.Items.map((item) => {
      return unmarshall(item);
    }) as QuestionDBItem[],
    lastEvaluatedKey: response.LastEvaluatedKey
      ? response.LastEvaluatedKey.PK.S
      : undefined,
  };
};
