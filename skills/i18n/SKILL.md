---
name: i18n
description: Add or update translated strings in the CS Demo Manager UI using LinguiJS. Use when adding user-visible text, labels, placeholders, error messages, or any string that should be localized. Handles Trans, useLingui, Plural, msg macros, context disambiguation, and the extract workflow.
user-invocable: false
---

## Scope

Only `src/ui/` and `src/electron-main/` need translations. Server, node, and CLI code is **exempt**.

## Patterns

### Always Use Macros

Prefer macros over runtime components. Macros are compiled at build time, reducing bundle size:

```jsx
// ✅ Good - uses macro
import { Trans } from '@lingui/react/macro';

// ❌ Avoid - runtime only
import { Trans } from '@lingui/react';
```

**It's enforced by a lint rule!**

### Keep Messages Simple

Avoid complex expressions in messages - they'll be replaced with placeholders:

```jsx
// ❌ Bad - loses context
<Trans>Hello {user.name.toUpperCase()}</Trans>;
// Extracted as: "Hello {0}"

// ✅ Good - clear variable name
const userName = user.name.toUpperCase();
<Trans>Hello {userName}</Trans>;
// Extracted as: "Hello {userName}"
```

### Use Trans for JSX Content

The `Trans` macro is the primary way to translate JSX:

```jsx
import { Trans } from "@lingui/react/macro";

// Simple text
<Trans>Hello World</Trans>

// With variables
<Trans>Hello {userName}</Trans>

// With components (rich text)
<Trans>
  Read the <a href="/docs">documentation</a> for more info.
</Trans>

// Extracted as: "Read the <0>documentation</0> for more info."
```

**When to use**: For any translatable text in JSX elements.

### Use useLingui for Non-JSX

For strings outside JSX (attributes, alerts, function calls):

```jsx
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();

  const handleClick = () => {
    alert(t`Action completed!`);
  };

  return (
    <div>
      <img src="..." alt={t`Image description`} />
      <button onClick={handleClick}>{t`Click me`}</button>
    </div>
  );
}
```

**When to use**: Element attributes, alerts, function parameters, any non-JSX string.

### Use msg for Lazy Translations

When you need to define messages in arrays/objects:

```jsx
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

function StatusList() {
  const { _ } = useLingui();

  const statuses = {
    active: msg`Active`,
    inactive: msg`Inactive`,
    pending: msg`Pending`,
  };

  return Object.entries(statuses).map(([key, message]) => <div key={key}>{_(message)}</div>);
}
```

**When to use**: Module-level constants, arrays of messages, conditional message selection.

## Pluralization

Use the `Plural` macro for quantity-dependent messages:

```jsx
import { Plural } from '@lingui/react/macro';

<Plural value={messageCount} one="You have # message" other="You have # messages" />;
```

The `#` placeholder is replaced with the actual value.

### Exact Matches

Use `_N` syntax for exact number matches (takes precedence over plural forms):

```jsx
<Plural value={count} _0="No messages" one="One message" other="# messages" />
```

### With Variables and Components

Combine with `Trans` for complex messages:

```jsx
<Plural
  value={count}
  one={`You have # message, ${userName}`}
  other={
    <Trans>
      You have <strong>#</strong> messages, {userName}
    </Trans>
  }
/>
```

## Formatting Dates and Numbers

Use `i18n.date()` and `i18n.number()` for locale-aware formatting:

```jsx
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { i18n } = useLingui();
  const lastLogin = new Date();

  return <Trans>Last login: {i18n.date(lastLogin)}</Trans>;
}
```

These use the browser's `Intl` API for proper locale formatting.

## Message IDs and Context

### Explicit IDs

**Only use explicit `id` in `src/electron-main/` — never in the renderer process.**

The electron-main process requires explicit IDs because it uses a separate JSON catalog and cannot rely on auto-generated IDs from JSX extraction:

```tsx
// ✅ electron-main only
t({ id: 'notification.download.complete', message: 'Download complete' });

// ❌ Never in src/ui/ — let the macro generate the ID
<Trans id="some.id">Download complete</Trans>;
```

### Context for Disambiguation

When the same text has different meanings, use `context`:

```jsx
<Trans context="direction">right</Trans>
<Trans context="correctness">right</Trans>
```

These create separate catalog entries.

### Comments for Translators

Add context for translators:

```jsx
<Trans comment="Greeting shown on homepage">Hello World</Trans>
```

## Electron Main Process

`src/electron-main/` has its **own** Lingui config (`src/electron-main/lingui.config.ts`) and uses JSON catalogs instead of `.po`. The same macro rules apply; use `i18n` from `@lingui/core` directly (no React provider).

## After adding or changing strings

Re-generate `.po` files (both UI and electron-main catalogs):

```sh
vp run i18n:extract
```
