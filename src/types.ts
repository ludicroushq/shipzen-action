export type APIResponse<T> =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      data: T;
    };
export type VersionsData = APIResponse<{
  versions: string[];
}>;

export type VersionData = APIResponse<{
  tag: string;
  body: string;
  updatePatch: string;
}>;
