import { APIGatewayEvent } from "aws-lambda";

export const parseBody = (event: APIGatewayEvent): APIGatewayEvent => {
  if (event.httpMethod === "GET") {
    return event;
  }
  if (event.body !== null && event.body !== undefined) {
    return { ...event, body: JSON.parse(event.body) };
  }

  throw new Error("Body couldn't be parsed.");
};
