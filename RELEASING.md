# Releasing Thrust

## create-thrust

### One-time setup
- Add `NPM_TOKEN` as a GitHub Actions secret
- Ensure the npm package name `create-thrust` is still available or owned by you

### Release flow
1. Update `packages/create-thrust/package.json` version
2. Run locally:
   ```bash
   bun run create-thrust:sync
   bun run build:client
   bun run test
   bun run build:css
   bun run create-thrust:variant-test
   bun run create-thrust:pack-test
   cd qa && bun install && bun run install:browsers && bun run test:notes-reference && cd ..
   ```
3. Commit and push to `main`
4. Trigger the GitHub Actions workflow:
   - `Publish create-thrust`
5. Verify published package:
   ```bash
   bunx create-thrust@latest thrust-smoke --no-install
   cd thrust-smoke
   bun install
   bun run build:client
   bun run build:css
   bun run test
   ```

### Notes
- The workflow re-runs tests, the variant test, and the pack test before publishing
- Generated apps create their own `bun.lock` on first install
- Keep the starter synced before every release
