import semanticRelease from 'semantic-release';

const MARKER = '<!-- release-preview -->';

const {
  BASE_REF: baseRef,
  HEAD_REF: headRef,
  HEAD_SHA: headSha = '',
  PR_NUMBER: prNumber,
  GITHUB_REPOSITORY: repository,
  GITHUB_TOKEN: token,
  GITHUB_API_URL: apiUrl = 'https://api.github.com',
} = process.env;

for (const [name, value] of Object.entries({
  BASE_REF: baseRef,
  PR_NUMBER: prNumber,
  GITHUB_REPOSITORY: repository,
  GITHUB_TOKEN: token,
})) {
  if (!value) throw new Error(`${name} is required`);
}

const api = async (path, init = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `${init.method ?? 'GET'} ${path} -> ${response.status}: ${await response.text()}`,
    );
  }

  return response.json();
};

const renderBody = (result) => {
  const lines = [
    MARKER,
    '### 📦 Release preview',
    '',
    `\`${headRef}\` → \`${baseRef}\``,
    '',
  ];

  if (!result) {
    lines.push(
      '**No release.** Nothing in this PR bumps the version: it carries no',
      '`feat:`, `fix:` or breaking-change commit.',
      '',
      'Merging it runs the pipeline, but it stops after the release stage and',
      'nothing is published.',
    );
  } else {
    const { lastRelease, nextRelease, commits } = result;

    lines.push(
      '| | |',
      '|---|---|',
      `| Current | ${lastRelease?.version ? `\`${lastRelease.version}\`` : '_none_'} |`,
      `| Next | **\`${nextRelease.version}\`** |`,
      `| Bump | \`${nextRelease.type}\` |`,
      `| Commits analysed | ${commits.length} |`,
      '',
      '<details><summary>Release notes</summary>',
      '',
      nextRelease.notes ?? '_none_',
      '',
      '</details>',
    );
  }

  lines.push('', `<sub>semantic-release dry run · ${headSha.slice(0, 7) || 'HEAD'}</sub>`);

  return lines.join('\n');
};

const findExistingComment = async () => {
  const perPage = 100;

  for (let page = 1; ; page++) {
    const comments = await api(
      `/repos/${repository}/issues/${prNumber}/comments?per_page=${perPage}&page=${page}`,
    );

    const match = comments.find(
      (comment) => comment.user?.type === 'Bot' && comment.body?.includes(MARKER),
    );
    if (match) return match;

    if (comments.length < perPage) return undefined;
  }
};

const { GITHUB_ACTIONS, ...env } = process.env;

// Only the version and notes are needed here, so the npm and GitHub plugins (and their auth checks) are skipped.
const result = await semanticRelease(
  {
    dryRun: true,
    ci: false,
    plugins: ['@semantic-release/commit-analyzer', '@semantic-release/release-notes-generator'],
  },
  { env },
);
const body = renderBody(result);
const existing = await findExistingComment();

if (existing) {
  await api(`/repos/${repository}/issues/comments/${existing.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  });
} else {
  await api(`/repos/${repository}/issues/${prNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

console.log(
  `${existing ? 'updated' : 'created'} preview comment: ${
    result ? result.nextRelease.version : 'no release'
  }`,
);
