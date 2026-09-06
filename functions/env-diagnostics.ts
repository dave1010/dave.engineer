type Env = {
  GROQ_API_KEY?: string;
  SECRET1?: string;
  TEXT1?: string;
};

type PagesFunction<FunctionEnv> = (context: { env: FunctionEnv }) => Response | Promise<Response>;

const describeBinding = (value: unknown) => ({
  present: value !== undefined,
  type: typeof value,
  nonEmpty: typeof value === "string" && value.trim().length > 0,
  length: typeof value === "string" ? value.length : null,
});

export const onRequestGet: PagesFunction<Env> = ({ env }) =>
  Response.json(
    {
      GROQ_API_KEY: describeBinding(env.GROQ_API_KEY),
      SECRET1: describeBinding(env.SECRET1),
      TEXT1: describeBinding(env.TEXT1),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
