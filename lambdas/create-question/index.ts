import { APIGatewayEvent, Context, Handler } from "aws-lambda";
import { parseBody } from "../../shared/utils";
import { createQuestion } from "./lib";

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<{ statusCode: number; body: string }> => {
  console.log("Create question started");

  let parsed;
  try {
    parsed = parseBody(event);
  } catch (e) {
    return { statusCode: 400, body: "There was an error parsing the input" };
  }

  const { question, userId } = parsed.body;

  const response = await createQuestion(question, userId);
  if (!response) {
    console.error("There was a problem creating a question");
    return {
      statusCode: 500,
      body: "There was a problem creating you question",
    };
  }
  return { statusCode: 201, body: JSON.stringify(response) };
};
