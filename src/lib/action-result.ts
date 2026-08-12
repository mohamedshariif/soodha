export type ActionResult = {
  ok: boolean;
  message: string;
};

export function actionSuccess(message: string): ActionResult {
  return {
    ok: true,
    message,
  };
}

export function actionError(error: unknown, fallbackMessage: string): ActionResult {
  if (error instanceof Error && error.message) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: false,
    message: fallbackMessage,
  };
}