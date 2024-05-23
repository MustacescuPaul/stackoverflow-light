import { APIGatewayEvent, Context, Handler } from "aws-lambda";
import { getQuestion } from "../../shared/aws/dynamo";

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<{ statusCode: number; body: string }> => {
  console.log("Get question started");
  console.log(event);
  console.log(context);
  if (!event.pathParameters || !event.pathParameters.questionId) {
    return { statusCode: 400, body: "QuestionId is required" };
  }

  const response = await getQuestion(event.pathParameters.questionId);

  if (!response) {
    return {
      statusCode: 404,
      body: "Question not found",
    };
  }
  return { statusCode: 200, body: JSON.stringify(response) };
};
