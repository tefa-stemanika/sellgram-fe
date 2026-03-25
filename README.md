This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
order-bot-dashboard
├─ .env
├─ .eslintrc.json
├─ .husky
│  ├─ _
│  │  ├─ applypatch-msg
│  │  ├─ commit-msg
│  │  ├─ h
│  │  ├─ husky.sh
│  │  ├─ post-applypatch
│  │  ├─ post-checkout
│  │  ├─ post-commit
│  │  ├─ post-merge
│  │  ├─ post-rewrite
│  │  ├─ pre-applypatch
│  │  ├─ pre-auto-gc
│  │  ├─ pre-commit
│  │  ├─ pre-merge-commit
│  │  ├─ pre-push
│  │  ├─ pre-rebase
│  │  └─ prepare-commit-msg
│  ├─ commit-msg
│  ├─ pre-commit
│  └─ pre-push
├─ .prettierignore
├─ .prettierrc
├─ README.md
├─ actions
│  └─ auth.ts
├─ app
│  ├─ (auth)
│  │  ├─ login
│  │  │  ├─ _layouts
│  │  │  │  └─ login-layout.tsx
│  │  │  └─ page.tsx
│  │  └─ register
│  │     ├─ _layouts
│  │     │  └─ register-layout.tsx
│  │     └─ page.tsx
│  ├─ (user)
│  │  ├─ _components
│  │  │  └─ data-table.tsx
│  │  ├─ _constants
│  │  │  └─ data.ts
│  │  ├─ _layouts
│  │  │  └─ home-layout.tsx
│  │  ├─ _stores
│  │  │  └─ use-user-store.ts
│  │  ├─ page.tsx
│  │  └─ types.ts
│  ├─ _components
│  │  └─ theme-provider.tsx
│  ├─ favicon.ico
│  ├─ fonts
│  │  ├─ GeistMonoVF.woff
│  │  └─ GeistVF.woff
│  ├─ globals.css
│  └─ layout.tsx
├─ commitlint.config.js
├─ components
│  ├─ core
│  ├─ shared
│  └─ ui
│     ├─ accordion.tsx
│     ├─ alert-dialog.tsx
│     ├─ alert.tsx
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ breadcrumb.tsx
│     ├─ button.tsx
│     ├─ calendar.tsx
│     ├─ card.tsx
│     ├─ carousel.tsx
│     ├─ chart.tsx
│     ├─ checkbox.tsx
│     ├─ dialog.tsx
│     ├─ dropdown-menu.tsx
│     ├─ form.tsx
│     ├─ hover-card.tsx
│     ├─ input-otp.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ navigation-menu.tsx
│     ├─ pagination.tsx
│     ├─ popover.tsx
│     ├─ progress.tsx
│     ├─ radio-group.tsx
│     ├─ resizable.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ separator.tsx
│     ├─ sheet.tsx
│     ├─ sidebar.tsx
│     ├─ skeleton.tsx
│     ├─ sonner.tsx
│     ├─ switch.tsx
│     ├─ table.tsx
│     ├─ textarea.tsx
│     ├─ toggle-group.tsx
│     ├─ toggle.tsx
│     └─ tooltip.tsx
├─ components.json
├─ hooks
│  └─ use-mobile.tsx
├─ json
│  └─ data.json
├─ lib
│  └─ utils.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ icons
│  └─ images
├─ schemas
│  ├─ auth.ts
│  ├─ cashflow.ts
│  └─ user.ts
├─ services
│  ├─ cashflow
│  │  └─ index.ts
│  ├─ fetcher.ts
│  ├─ index.ts
│  └─ user
│     └─ index.ts
├─ tailwind.config.ts
└─ tsconfig.json

```