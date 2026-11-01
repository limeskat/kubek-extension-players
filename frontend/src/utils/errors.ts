/**
 * Turn an error thrown by the panel's HTTP client into the message the extension backend
 * returned (e.g. "Cannot purge data while the player is online").
 */
export async function getMutationErrorMessage(error: unknown): Promise<string> {
  const err = error as any;
  const response = err?.response;
  if (response && typeof response.json === "function") {
    try {
      const body = await response.json();
      if (typeof body?.error === "string") return body.error;
      if (typeof body?.message === "string") return body.message;
    } catch {
      // body was not JSON, fall through to the generic message
    }
  }
  if (typeof err?.message === "string" && err.message) return err.message;
  return "The action failed. Check that the server is running and try again.";
}

export function alertMutationError(error: unknown): void {
  void getMutationErrorMessage(error).then((message) => {
    if (typeof window !== "undefined") window.alert(message);
  });
}
