import { APIGatewayEvent } from "aws-lambda";

export type APIGatewayParsedEvent<T> = APIGatewayEvent & {
  body: T;
};

export type Question = {
  body: string;
};

export type QuestionRequest = {
  question: Question;
  userId: string;
};

export type Answer = {
  body: string;
};

export type AnswerRequest = {
  questionId: string;
  answer: Answer;
  userId: string;
};

export type AnswerDBItem = {
  body: string;
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
};

export type QuestionDBItem = {
  body: string;
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
};

export type AnswerQuery = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  body: string;
};

export type QuestionQuery = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  body: string;
};
