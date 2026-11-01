/**
 * Turn an error thrown by the panel's HTTP client into the message the extension backend
 * returned (e.g. "Cannot purge data while the player is online").
 */
export function getMutationErrorMessage(error: unknown): Promise<string> {
  const err = error as any;
  const response = err?.response;
  if (response && typeof response.json === "function") {
    return Promise.resolve()
      .then(() => response.json())
      .then((body: any) => {
        if (typeof body?.error === "string") return body.error;
        if (typeof body?.message === "string") return body.message;
        return generic(err);
      })
      .catch(() => generic(err));
  }
  return Promise.resolve(generic(err));
}

function generic(err: any): string {
  if (typeof err?.message === "string" && err.message) return err.message;
  return "The action failed. Check that the server is running and try again.";
}
