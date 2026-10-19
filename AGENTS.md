<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use Lovable Cloud for authenticated, owner-scoped case records and private evidence uploads; never fall back to mock results or browser-stored case records, because the user now requires real persistence.
- Share the create-case screen between the home and create-case routes, and keep primary navigation in AppShell, so both entry points use the same simple workspace.
- Keep browser database and Storage API operations in the investigations service behind RLS, and use one root AuthProvider for session and cache invalidation; public shells offer inline sign-in without private SSR loaders.
- Validate upload extension, MIME, size, and file signature before private storage upload, and compensate for failed metadata inserts by removing the uploaded object, so failures do not masquerade as success.
