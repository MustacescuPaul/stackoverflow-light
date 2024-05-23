import { mapCreateAnswerQuery } from "../lib";
import { Answer } from "../../../shared/types";

describe("test create-answer lib", () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date("2019-04-07T10:20:30Z").getTime());
  });
  test("mapCreateAnswerQuery should structure the query based on input", () => {
    const answer: Answer = {
      body: "test answer",
    };
    const userId = "123123";
    const answerId = "112233";
    const questionId = "1111";

    const expected = {
      PK: "QUESTION#1111",
      SK: "ANSWER#112233",
      GSI1PK: "USER#123123",
      GSI1SK: "ANSWER#112233",
      GSI2PK: "ANSWER",
      GSI2SK: "1554632430000",
      body: "test answer",
    };

    const createQuestionQuery = mapCreateAnswerQuery(
      answer,
      userId,
      answerId,
      questionId,
    );

    expect(createQuestionQuery).toEqual(expected);
  });
});
