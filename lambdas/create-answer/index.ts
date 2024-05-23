import { APIGatewayEvent, Context, Handler } from "aws-lambda";
import { parseBody } from "../../shared/utils";
import { AnswerRequest } from "../../shared/types";
import { createAnswer } from "./lib";

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<{ statusCode: number; body: string }> => {
  console.log("Create answer started");

  let parsed;
  try {
    parsed = parseBody(event);
  } catch (e) {
    return { statusCode: 400, body: "There was an error parsing the input" };
  }
  if (!parsed.body) {
    return { statusCode: 400, body: "Body is required" };
  }

  const { answer, questionId, userId } =
    parsed.body as unknown as AnswerRequest;

  try {
    const response = await createAnswer(answer, questionId, userId);

    return { statusCode: 201, body: JSON.stringify(response) };
  } catch (e) {
    return {
      statusCode: 500,
      body: "There was a problem creating you answer",
    };
  }
};
