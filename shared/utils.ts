import { APIGatewayEvent } from "aws-lambda";
import { APIGatewayParsedEvent, QuestionRequest } from "./types";

export const parseBody = (
  event: APIGatewayEvent,
): APIGatewayParsedEvent<QuestionRequest> => {
  if (event.body !== null && event.body !== undefined) {
    return { ...event, body: JSON.parse(event.body) };
  }

  throw new Error("Body couldn't be parsed.");
};

export const getEnvVar = (key: string): string => {
  if (!process.env[key]) {
    throw new Error("Env variable not set");
  }

  return process.env[key]!;
};
