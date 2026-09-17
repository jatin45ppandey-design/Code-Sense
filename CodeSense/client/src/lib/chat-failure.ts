import { ApiError } from "@/lib/api/client";

export type ChatFailure = {
  title: string;
  description: string;
};

export function classifyChatFailure(error: unknown): ChatFailure {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return {
        title: "We’re sorry for the interruption",
        description:
          "CodeSense is currently running on a free-tier AI setup, and the available request limit has temporarily been reached. Please wait a little and try again.",
      };
    }

    if (error.status === 503) {
      return {
        title: "We’re sorry for the interruption",
        description:
          "Our AI provider is currently experiencing high demand. Because CodeSense is running on a free-tier AI setup, availability can occasionally be limited during busy periods. Please try again shortly.",
      };
    }
  }

  if (
    error instanceof TypeError ||
    (error instanceof Error && /network|failed to fetch/i.test(error.message))
  ) {
    return {
      title: "We’re sorry for the inconvenience",
      description:
        "CodeSense couldn’t reach the AI service reliably just now. Please check your connection and try again.",
    };
  }

  return {
    title: "We’re sorry — that response couldn’t be completed",
    description:
      "Something interrupted the AI response. Your workspace is still available, and you can try the request again.",
  };
}
