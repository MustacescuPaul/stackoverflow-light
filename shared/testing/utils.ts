import axios, { AxiosRequestConfig } from "axios";
import { clientCredentials } from "axios-oauth-client";

export const creatAuthorisedAxiosInstance = async () => {
  const baseURL = "https://cn2j90jt69.execute-api.eu-west-2.amazonaws.com/v1/";

  const getClientCredentials = clientCredentials(
    axios.create(),
    "https://stackoverflow-light-xyz-auth-api.auth.eu-west-2.amazoncognito.com/oauth2/token",
    "4kpskjs6chl335v3cpakkd5j91",
    "1distm3dmln4pnjevmpr3jejrbdfjjaplt7k6novrfhj43er54vk",
  );

  const auth = await getClientCredentials("");
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: auth.access_token,
    },
    baseURL,
  };

  return axios.create(config);
};
