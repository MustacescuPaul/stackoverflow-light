import { PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { creatAuthorisedAxiosInstance } from "../shared/testing/utils";
import {
  AnswerDBItem,
  AnswerRequest,
  QuestionDBItem,
  QuestionRequest,
} from "../shared/types";

describe("test create-question", () => {
  test("should create a question and return it", async () => {
    const authenticatedAxios = await creatAuthorisedAxiosInstance();

    const request: QuestionRequest = {
      question: { body: "test question" },
      userId: "121212",
    };

    const res = {
      ...request.question,
      GSI1PK: expect.any(String),
      GSI1SK: expect.any(String),
      GSI2PK: expect.any(String),
      GSI2SK: expect.any(String),
      PK: expect.any(String),
      SK: expect.any(String),
    };

    try {
      const response = await authenticatedAxios.post<QuestionRequest>(
        `questions`,
        request,
      );

      expect(response).toBeDefined();
      expect(response.data).toEqual(res);
    } catch (e) {
      console.log(e);
    }
  });
});

describe("test get-question", () => {
  //I will use the create question endpoint to test the GET. This means the GET test can fail because of the POST
  //I would probably use a test CRUD endpoint if I had more time
  test("should get a question by questionId", async () => {
    const authenticatedAxios = await creatAuthorisedAxiosInstance();

    const request: QuestionRequest = {
      question: { body: "test question" },
      userId: "121212",
    };

    let newQuestion;

    try {
      newQuestion = await authenticatedAxios.post<
        QuestionRequest,
        { data: QuestionDBItem }
      >(`questions`, request);
    } catch (e) {
      console.log("Failed to create question", e);
    }
    if (!newQuestion) {
      throw new Error("Create question failed");
    }
    const questionId = newQuestion.data.PK.split("#")[1];
    try {
      const res = await authenticatedAxios.get<any, { data: QuestionDBItem }>(
        `questions/${questionId}`,
      );

      expect(res.data).toEqual(newQuestion.data);
    } catch (e) {
      console.log("Failed to create question", e);
    }
  });

  test("should return 404 if  question doesn't exist", async () => {
    const authenticatedAxios = await creatAuthorisedAxiosInstance();
    const questionId = "123";
    try {
      const res = await authenticatedAxios.get<any, { data: QuestionDBItem }>(
        `questions/${questionId}`,
      );

      expect(res.data).toEqual({});
    } catch (e: any) {
      if (e.response.status != 404) {
        console.log("Failed to create question", e);
      }
    }
  });
});

describe("test get-questions", () => {
  test("should get all questions", async () => {
    const authenticatedAxios = await creatAuthorisedAxiosInstance();

    try {
      const response = await authenticatedAxios.get<{
        items: QuestionDBItem[];
        lastEvaluatedKey?: string;
      }>(`questions`);
      console.log(response.data);
      expect(response).toBeDefined();
      expect(response.data.items).toEqual(expect.any(Array));
    } catch (e) {
      console.log(e);
    }
  });
});

describe("test create-answer", () => {
  test("should create an answer for a question", async () => {
    const authenticatedAxios = await creatAuthorisedAxiosInstance();

    const request: QuestionRequest = {
      question: { body: "test question" },
      userId: "121212",
    };

    let answerResponse;
    try {
      answerResponse = await authenticatedAxios.post<
        QuestionRequest,
        { data: QuestionDBItem }
      >(`questions`, request);
    } catch (e) {
      console.log(e);
    }

    if (!answerResponse) {
      throw new Error("Create answerResponse failed");
    }

    const questionId = answerResponse.data.PK.split("#")[1];

    const answerRequest: AnswerRequest = {
      answer: { body: "test answer" },
      userId: "121212",
      questionId: questionId,
    };

    try {
      const response = await authenticatedAxios.post<
        AnswerRequest,
        { data: PutItemCommandOutput }
      >(`answers`, answerRequest);

      expect(response).toBeDefined();
      expect(response.data.$metadata.httpStatusCode).toBe(200);
    } catch (e) {
      console.log(e);
    }
  });
});
