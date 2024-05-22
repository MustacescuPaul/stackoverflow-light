import { APIGatewayEvent, Context, Handler } from "aws-lambda";
import { parseBody } from "../../shared/utils";

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  console.log("Create question started");
  console.log(event);
  console.log(context);
  const parsed = parseBody(event);
  console.log(parsed.body);

  return { statusCode: 201, body: JSON.stringify(parsed.body) };
};
