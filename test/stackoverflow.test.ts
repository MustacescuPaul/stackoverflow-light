import { creatAuthorisedAxiosInstance } from "../shared/testing/utils";

describe("test", () => {
  test("test", async () => {
    const authenticatedAxios = await creatAuthorisedAxiosInstance();

    let response;
    try {
      response = await authenticatedAxios.post(`questions `, {
        test: "test",
      });
    } catch (e) {
      console.log(e);
    }
    console.log(response?.data);
  });
});
