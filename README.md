# Setup Instructions

## Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (automatically used via packageManager field)

### Installation & Running

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start development server**
   ```bash
   pnpm dev
   ```

   The website will be available at `http://localhost:5173` (or the port shown in your terminal)

### Other Commands

- **Build for production**
  ```bash
  pnpm build
  ```

- **Start production server**
  ```bash
  pnpm start
  ```

- **Preview production build**
  ```bash
  pnpm preview
  ```

- **Type checking**
  ```bash
  pnpm check
  ```

- **Format code**
  ```bash
  pnpm format
  ```

## Troubleshooting

If you encounter any issues:
1. Make sure you're using a compatible Node.js version (v18+)
2. Delete `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` again
3. Clear the Vite cache: delete the `node_modules/.vite` folder
