import { AxiosRequestConfig, AxiosError } from "axios";
import { API } from "./index";

interface FetcherOptions extends AxiosRequestConfig {
  onSuccess?: (response: { data: any; pagination: any }) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
  setLoading?: (loading: boolean) => void;
  setFetching?: (fetching: boolean) => void;
}

export const Fetcher = async (options: FetcherOptions) => {
  const {
    onSuccess,
    onError,
    onFinally,
    setLoading,
    setFetching,
    ...axiosOptions
  } = options;

  // Loading state handling
  if (setLoading && setFetching) {
    setFetching(true);
  }

  try {
    const response = await API(axiosOptions);

    // Handle success
    if (!!onSuccess) {
      onSuccess({
        data: response.data.data,
        pagination: response.data.pagination,
      });
    }

    return response;
  } catch (error) {
    // Handle error
    if (onError && error instanceof AxiosError) {
      onError(error.response?.data.message);
    }
    throw error;
  } finally {
    // Handle finally
    if (!!onFinally) {
      onFinally();
    }

    // Reset loading states
    if (setLoading && setFetching) {
      setFetching(false);
    }
  }
};
