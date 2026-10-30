
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
│  │  ├─ broadcasts
│  │  │  ├─ [id]
│  │  │  │  ├─ _components
│  │  │  │  │  └─ broadcast-detail-page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ create
│  │  │  │  ├─ _components
│  │  │  │  │  └─ broadcast-create-page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ _components
│  │  │  │  ├─ broadcast-columns.tsx
│  │  │  │  └─ broadcasts-client.tsx
│  │  │  └─ page.tsx
│  │  ├─ bot-config
│  │  │  ├─ _components
│  │  │  │  ├─ bot-config-client.tsx
│  │  │  │  ├─ bot-config-form.tsx
│  │  │  │  ├─ bot-health-card.tsx
│  │  │  │  └─ mode-preview-dialog.tsx
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
 │  │  ├─ fulfillment
 │  │  │  ├─ _components
 │  │  │  │  └─ fulfillment-client.tsx
 │  │  │  └─ page.tsx
 │  │  ├─ plan
 │  │  │  ├─ _components
 │  │  │  │  └─ plan-client.tsx
 │  │  │  └─ page.tsx
│  │  ├─ products
│  │  │  ├─ _components
│  │  │  │  ├─ delete-product-dialog.tsx
│  │  │  │  ├─ fulfillment-config-dialog.tsx
│  │  │  │  ├─ product-columns.tsx
│  │  │  │  ├─ product-form.tsx
│  │  │  │  └─ products-client.tsx
│  │  │  └─ page.tsx
│  │  ├─ customers
│  │  │  ├─ _components
│  │  │  │  ├─ customer-columns.tsx
│  │  │  │  ├─ customer-detail-dialog.tsx
│  │  │  │  ├─ customer-form-dialog.tsx
│  │  │  │  └─ customers-client.tsx
│  │  │  └─ page.tsx
│  │  ├─ templates
│  │  │  ├─ [id]
│  │  │  │  ├─ edit
│  │  │  │  │  ├─ _components
│  │  │  │  │  │  └─ template-edit-page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  ├─ create
│  │  │  │  ├─ _components
│  │  │  │  │  └─ template-create-page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ _components
│  │  │  │  ├─ template-columns.tsx
│  │  │  │  ├─ template-detail-dialog.tsx
│  │  │  │  └─ templates-client.tsx
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
│  │  ├─ auth-shell.tsx
│  │  ├─ data-table-pagination.tsx
│  │  ├─ empty-state.tsx
│  │  ├─ metric-card.tsx
│  │  ├─ page-header.tsx
│  │  ├─ quota-bar.tsx
│  │  ├─ status-badge.tsx
│  │  ├─ surface.tsx
│  │  └─ telegram-chat-preview.tsx
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
│  ├─ analytics.ts
│  ├─ status-tokens.ts
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
│  ├─ broadcast.ts
│  ├─ bot-config.ts
│  ├─ bot-credentials.ts
│  ├─ cashflow.ts
│  ├─ customers.ts
│  ├─ products.ts
│  └─ user.ts
├─ services
│  ├─ broadcast
│  │  └─ index.ts
│  ├─ bot-config
│  │  └─ index.ts
│  ├─ bot-credentials
│  │  └─ index.ts
│  ├─ bot-health
│  │  └─ index.ts
│  ├─ cashflow
│  │  └─ index.ts
│  ├─ customers
│  │  └─ index.ts
│  ├─ dashboard
│  │  └─ index.ts
│  ├─ fetcher.ts
│  ├─ fulfillment
│  │  └─ index.ts
│  ├─ index.ts
│  ├─ orders
│  │  └─ index.ts
│  ├─ products
│  │  └─ index.ts
│  ├─ template
│  │  └─ index.ts
│  └─ user
│     └─ index.ts
├─ tailwind.config.ts
└─ tsconfig.json

```