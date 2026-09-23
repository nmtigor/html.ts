Archive this repository because this is part of [cimpiling.ts](https://github.com/nmtigor/compiling.ts/tree/main/src/lib/compiling/html).

---

This program implements
[HTML Living Standard (2026-09-08) 13.2 Parsing HTML documents](https://html.spec.whatwg.org/multipage/parsing.html)
with following settings:

- Deprecated tags and features are not handled.
- "parser scripting mode" is "Disabled".
- "fragment case" are not handled.

## Unittest

```bash
cd /path_to/html.ts
# deno 2.7.13
deno test -R --reporter=dot # 2 passed (8256 steps)
```
