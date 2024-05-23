import axios, { AxiosRequestConfig } from "axios";
import { clientCredentials } from "axios-oauth-client";

export const creatAuthorisedAxiosInstance = async () => {
  const baseURL = "https://atqs3hh569.execute-api.eu-west-2.amazonaws.com/v1/";

  const getClientCredentials = clientCredentials(axios.create(), "", "", "");

  const auth = await getClientCredentials("");
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: auth.access_token,
    },
    baseURL,
  };

  return axios.create(config);
};
