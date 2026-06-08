
```
order-bot-dashboard
├─ .env
├─ .env.example
├─ .eslintrc.json
├─ .prettierignore
├─ .prettierrc
├─ AGENTS.md
├─ README.md
├─ actions
│  └─ auth.ts
├─ app
│  ├─ (public)
│  │  └─ store
│  │     └─ [userId]
│  │        ├─ order
│  │        │  └─ [orderId]
│  │        │     └─ page.tsx
│  │        ├─ product
│  │        │  └─ [productId]
│  │        │     └─ page.tsx
│  │        └─ page.tsx
│  ├─ payment
│  │  └─ success
│  │     ├─ _components
│  │     │  └─ payment-success-client.tsx
│  │     └─ page.tsx
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
│  │  │  ├─ dashboard-overview.tsx
│  │  │  └─ data-table.tsx
│  │  ├─ _constants
│  │  │  └─ data.ts
│  │  ├─ _layouts
│  │  │  └─ home-layout.tsx
│  │  ├─ _stores
│  │  │  └─ use-user-store.ts
│  │  ├─ bot-config
│  │  │  ├─ _components
│  │  │  │  ├─ bot-config-client.tsx
│  │  │  │  └─ bot-config-form.tsx
│  │  │  └─ page.tsx
│  │  ├─ bot-credentials
│  │  │  ├─ _components
│  │  │  │  ├─ credential-columns.tsx
│  │  │  │  ├─ credential-form.tsx
│  │  │  │  ├─ credentials-client.tsx
│  │  │  │  └─ delete-credential-dialog.tsx
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ orders
│  │  │  ├─ _components
│  │  │  │  ├─ order-columns.tsx
│  │  │  │  ├─ order-detail-dialog.tsx
│  │  │  │  └─ orders-client.tsx
│  │  │  └─ page.tsx
│  │  ├─ products
│  │  │  ├─ _components
│  │  │  │  ├─ delete-product-dialog.tsx
│  │  │  │  ├─ product-columns.tsx
│  │  │  │  ├─ product-form.tsx
│  │  │  │  └─ products-client.tsx
│  │  │  └─ page.tsx
│  │  └─ types.ts
│  ├─ tickets
│  │  ├─ _components
│  │  │  ├─ ticket-card.tsx
│  │  │  ├─ ticket-detail-dialog.tsx
│  │  │  ├─ tickets-board.tsx
│  │  │  └─ tickets-client.tsx
│  │  └─ page.tsx
│  ├─ _components
│  │  └─ theme-provider.tsx
│  ├─ favicon.ico
│  ├─ fonts
│  │  ├─ GeistMonoVF.woff
│  │  └─ GeistVF.woff
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ robots.ts
│  └─ sitemap.ts
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
├─ proxy.ts
├─ public
│  ├─ icons
│  └─ images
│     └─ sellgram_seo.png
├─ schemas
│  ├─ auth.ts
│  ├─ bot-config.ts
│  ├─ bot-credentials.ts
│  ├─ cashflow.ts
│  ├─ products.ts
│  └─ user.ts
├─ services
│  ├─ public
│  │  └─ index.ts
│  ├─ bot-config
│  │  └─ index.ts
│  ├─ bot-credentials
│  │  └─ index.ts
│  ├─ cashflow
│  │  └─ index.ts
│  ├─ fetcher.ts
│  ├─ index.ts
│  ├─ orders
│  │  └─ index.ts
│  ├─ products
│  │  └─ index.ts
│  └─ user
│     └─ index.ts
├─ tailwind.config.ts
└─ tsconfig.json

```