export type TerminalPromptEnv = {
  ASSETS: {
    fetch(request: Request | string, init?: RequestInit): Promise<Response>;
  };
};

const PROMPT_HEADER = `You are acting as a pretend Linux bash shell terminal. All the user's messages are shell commands. Respond to the user's shell commands with just the shell output. No other content. No code blocks or formatting needed. The user has full sudo privileges. The system has full network connectivity. Don't mention anything to do with the terminal being pretend. Be lenient if a command isn't right. Make it interesting and fun, especially if the user pokes around!`;

const HELLO_FILE_CONTENT = `Welcome to the https://dave.engineer interactive terminal!\n© Dave Hulbert dave1010@gmail.com`;

type TerminalPromptFile = {
  name: string;
  load(context: TerminalPromptContext): Promise<string> | string;
};

type TerminalPromptContext = {
  env: TerminalPromptEnv;
  request: Request;
};

const PROMPT_FILES: readonly TerminalPromptFile[] = [
  {
    name: "hello.txt",
    load: () => HELLO_FILE_CONTENT,
  },
  {
    name: "index.md",
    load: ({ env, request }) => loadAssetFile(env, request, "/index.md"),
  },
];

const assetCache = new Map<string, Promise<string>>();

export async function buildTerminalSystemPrompt(
  env: TerminalPromptEnv,
  request: Request,
): Promise<string> {
  const context: TerminalPromptContext = { env, request };
  const sections: string[] = [];

  for (const file of PROMPT_FILES) {
    const section = await loadFileSection(file, context);
    if (section) sections.push(section);
  }

  return [PROMPT_HEADER, ...sections].join("\n\n");
}

async function loadFileSection(
  file: TerminalPromptFile,
  context: TerminalPromptContext,
): Promise<string | null> {
  try {
    const raw = await file.load(context);
    const content = typeof raw === "string" ? raw : String(raw);
    const trimmed = content.trimEnd();
    return `In the current directory is the file ${file.name}, with the content:\n\n${trimmed}`;
  } catch (error) {
    console.error(`Failed to load terminal prompt file "${file.name}"`, error);
    return null;
  }
}

async function loadAssetFile(
  env: TerminalPromptEnv,
  request: Request,
  path: string,
): Promise<string> {
  const cacheKey = path;
  const existing = assetCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const assetPath = path.startsWith("/") ? path : `/${path}`;
    const assetUrl = new URL(assetPath, request.url);
    const response = await env.ASSETS.fetch(assetUrl.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch ${assetPath}: ${response.status} ${response.statusText}`);
    }
    return response.text();
  })();

  assetCache.set(cacheKey, promise);
  try {
    return await promise;
  } catch (error) {
    assetCache.delete(cacheKey);
    throw error;
  }
}
