import { mapCreateQuestionQuery } from "../lib";
import { Question } from "../../../shared/types";

describe("test create-question lib", () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date("2019-04-07T10:20:30Z").getTime());
  });
  test("mapQuestionQuery should structure the query based on input", () => {
    const question: Question = {
      body: "test question",
    };
    const userId = "123123";
    const questionId = "112233";

    const expected = {
      PK: "QUESTION#112233",
      SK: "QUESTION#112233",
      GSI1PK: "USER#123123",
      GSI1SK: "QUESTION#112233",
      GSI2PK: "QUESTION",
      GSI2SK: "1554632430000",
      body: "test question",
    };

    const createQuestionQuery = mapCreateQuestionQuery(
      question,
      userId,
      questionId,
    );

    expect(createQuestionQuery).toEqual(expected);
  });
});
