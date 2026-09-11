# Dependency audit exceptions

This file records narrowly scoped exceptions to the high-severity dependency audit. An entry is not a declaration that the advisory is harmless; it documents why the vulnerable code is not reachable in the deployed product and when the exception must be removed.

## `image-size@2.0.2` through `vinext@0.0.50`

| Field                   | Decision                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Advisories              | `GHSA-w3rx-r6r6-pgpr`, `GHSA-5p2g-fcmc-qvqq`                                                                                                                                       |
| Severity                | High (availability / denial of service)                                                                                                                                            |
| Affected parsers        | ICNS, JXL and HEIF                                                                                                                                                                 |
| Dependency path         | Development/build dependency: `vinext` → `image-size`                                                                                                                              |
| Production reachability | Not reachable. The deployed GitHub Pages artifact is static and does not execute `vinext`, Node.js or `image-size`.                                                                |
| Build reachability      | Limited to repository-controlled assets. The build accepts no user-uploaded or network-supplied images, and the tracked brand assets are PNG/JPEG.                                 |
| Published fix           | None as of 2026-09-10. The newest published `image-size` release is `2.0.2`; the GitHub advisories list no patched version.                                                        |
| Decision                | Temporarily ignore only these two GHSA identifiers in `pnpm audit`. All other high or critical advisories continue to fail CI.                                                     |
| Removal condition       | Remove the exceptions when a patched `image-size` release is published, or when a stable `vinext` release removes the dependency. Re-evaluate whenever either package is upgraded. |

The exception must be revisited before enabling image uploads, remote image processing, or untrusted build inputs.
