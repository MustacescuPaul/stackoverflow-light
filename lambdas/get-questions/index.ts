import { APIGatewayEvent, Context, Handler } from "aws-lambda";
import { getQuestions } from "./lib";
import { getQuestion } from "../../shared/aws/dynamo";

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<{ statusCode: number; body: string }> => {
  console.log("Get questions started");

  let lastEvaluatedKey;
  if (event.queryStringParameters?.lastEvaluatedKey) {
    lastEvaluatedKey = await getQuestion(
      event.queryStringParameters.lastEvaluatedKey,
    );
  }

  const response = await getQuestions(lastEvaluatedKey);

  return { statusCode: 200, body: JSON.stringify(response) };
};
