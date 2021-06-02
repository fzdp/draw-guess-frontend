import axios from "axios"

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL
});
api.handleError = () => {};

api.interceptors.request.use(
    config => {
      config.headers.Authorization = api.getAuthorization();
      return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => Promise.resolve(response),
    error => {
      if (!error.response.config.skipErrorHandler) {
        api.handleError(error);
        return new Promise(() => {
        });
      } else {
        return Promise.reject(error);
      }
    }
);

export default api;
