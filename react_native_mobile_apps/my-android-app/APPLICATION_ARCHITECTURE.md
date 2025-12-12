## eCommerce React Native Application: Application Design

This document details the application architecture, database schema, folder structure, and JSON configuration design for the React Native eCommerce application. It is tailored to the current project structure which utilizes **Expo Router**, **NativeWind (Tailwind CSS)**, and **TypeScript**.

### 1. Application Architecture

The application follows a **Layered Architecture** adapted for the React Native ecosystem, leveraging the existing Expo Router file-based routing and NativeWind for styling.

*   **Presentation Layer:**
    *   **Framework:** React Native with **Expo Router** for navigation.
    *   **Styling:** **NativeWind** (Tailwind CSS) is the primary styling engine. All components should use utility classes (e.g., `className="bg-white p-4"`) for consistent design.
    *   **Components:** Located in the root `components/` directory. Reusable UI elements (Buttons, Cards, Modals) reside here.
    *   **Screens:** Defined as pages in the `app/` directory.
    *   **State:** Uses **React Context** and **Custom Hooks** for managing local and global state.
*   **Business Logic Layer (BLL) / Domain Layer:**
    *   Contains the core business logic and rules.
    *   **Hooks:** Custom hooks (e.g., `useCart`, `useAuth`) will encapsulate logic and expose data/methods to components.
    *   **Services:** Pure TypeScript modules for handling complex operations (e.g., `PaymentService`, `NotificationService`).
*   **Data Layer:**
    *   **Persistence:** **Expo SQLite** (`expo-sqlite`) for local database storage.
    *   **Repositories:** Abstract the data sources. For example, a `ProductRepository` handles fetching products from SQLite or a remote API, providing a clean API to the domain layer.

### 2. Database Schema

The application uses a local SQLite database managed via `expo-sqlite`.

*   **Users Table (`users`)**
    *   `user_id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
    *   `name` (TEXT, NOT NULL)
    *   `email` (TEXT, UNIQUE NOT NULL)
    *   `password_hash` (TEXT, NOT NULL)
    *   `created_at` (TEXT, DEFAULT (datetime('now')))

*   **Products Table (`products`)**
    *   `product_id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
    *   `name` (TEXT, NOT NULL)
    *   `description` (TEXT)
    *   `price` (REAL, NOT NULL)
    *   `image_urls` (TEXT) - JSON string array of image paths.
    *   `stock_quantity` (INTEGER, DEFAULT 0)
    *   `category_id` (INTEGER)
    *   `created_at` (TEXT, DEFAULT (datetime('now')))

*   **Cart Items Table (`cart_items`)**
    *   `cart_item_id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
    *   `user_id` (INTEGER, FOREIGN KEY -> users.user_id)
    *   `product_id` (INTEGER, FOREIGN KEY -> products.product_id)
    *   `quantity` (INTEGER, CHECK (quantity > 0))
    *   `added_at` (TEXT, DEFAULT (datetime('now')))
    *   UNIQUE (`user_id`, `product_id`)

*   **Orders Table (`orders`)**
    *   `order_id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
    *   `user_id` (INTEGER, FOREIGN KEY -> users.user_id)
    *   `order_date` (TEXT, DEFAULT (datetime('now')))
    *   `total_amount` (REAL, NOT NULL)
    *   `status` (TEXT, DEFAULT 'Pending')
    *   `shipping_address` (TEXT) - JSON string.

*   **Order Items Table (`order_items`)**
    *   `order_item_id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
    *   `order_id` (INTEGER, FOREIGN KEY -> orders.order_id)
    *   `product_id` (INTEGER, FOREIGN KEY -> products.product_id)
    *   `quantity` (INTEGER)
    *   `price_at_purchase` (REAL)

### 3. Folder Structure

The project adopts a structure that aligns with **Expo Router** conventions while keeping business logic organized.

```
my-android-app/
├── app/                         # Expo Router pages (Navigation Roots)
│   ├── _layout.tsx              # Root layout (Providers, Theme, Global setup)
│   ├── index.tsx                # Entry/Welcome screen
│   ├── (auth)/                  # Authentication Group (Login/Signup)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                  # Main Tab Navigation
│   │   ├── _layout.tsx
│   │   ├── home.tsx             # Home Tab
│   │   ├── cart.tsx             # Cart Tab
│   │   └── profile.tsx          # Profile Tab
│   ├── product/                 # Product Feature Routes
│   │   └── [id].tsx             # Product Details Page
│   └── global.css               # Global Tailwind directives
│
├── components/                  # Shared UI Components
│   ├── ui/                      # Generic UI atoms (Buttons, Inputs, Cards)
│   │   ├── CustomButton.tsx
│   │   └── AppGradient.tsx
│   ├── products/                # Product-specific components
│   │   ├── ProductCard.tsx
│   │   └── ProductList.tsx
│   └── cart/                    # Cart-specific components
│       └── CartItem.tsx
│
├── constants/                   # App Constants
│   ├── Colors.ts                # Color palette
│   └── Config.ts                # App-wide configuration
│
├── hooks/                       # Custom React Hooks (Business Logic)
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
│
├── services/                    # Core Services & Data Layer
│   ├── database/                # SQLite Database setup
│   │   ├── db.ts                # Database connection/initialization
│   │   └── schema.ts            # Table creation queries
│   ├── repositories/            # Data access layers
│   │   ├── ProductRepository.ts
│   │   └── UserRepository.ts
│   └── DynamicUiService.ts      # JSON UI parsing logic
│
├── assets/
│   ├── images/
│   ├── fonts/
│   └── ui_config/               # JSON files for dynamic UI
│       └── home_page.json
│
├── tailwind.config.js           # Tailwind configuration
├── babel.config.js              # Babel config (NativeWind plugin)
└── package.json
```

### 4. JSON Structure for Dynamic UI Configuration

JSON files stored in `assets/ui_config/` define the structure for dynamic pages.

**Example: `home_page.json`**
```json
{
  "page_title": "Home",
  "layout_type": "scroll_view",
  "components": [
    {
      "component_type": "carousel_banner",
      "properties": {
        "height": 200,
        "auto_play": true,
        "items": [
          {
            "image_asset": "assets/images/banners/promo1.png",
            "action": {
              "type": "push",
              "route": "/product/category/electronics"
            }
          }
        ]
      }
    },
    {
      "component_type": "section_header",
      "properties": {
        "title": "Featured Products",
        "className": "text-xl font-bold text-gray-800 my-4"
      }
    },
    {
      "component_type": "product_grid",
      "properties": {
        "item_count": 4,
        "source": "featured"
      }
    }
  ]
}
```

**Implementation Strategy:**
1.  **`DynamicUiService`**: Fetches and parses the JSON.
2.  **`DynamicRenderer` Component**: Takes the parsed JSON and maps `component_type` to actual React components (e.g., `carousel_banner` -> `<BannerCarousel />`).
3.  **Styling**: The JSON `properties` can include a `className` field to pass Tailwind classes directly to the rendered components, allowing for dynamic styling updates.

### 5. Best Practices for this Project

1.  **Strict TypeScript**: Ensure all components and functions are strictly typed. Use interfaces for Props and State.
2.  **NativeWind First**: Avoid `StyleSheet.create` unless absolutely necessary for dynamic values that Tailwind can't handle. Keep the UI code clean.
3.  **Component Modularity**: Break down large screens into smaller components in `components/`.
4.  **Expo Router Features**: Use `Stack` and `Tabs` layouts effectively. Use `useLocalSearchParams` for handling route parameters.
5.  **Asset Management**: Use `expo-image` for optimized image loading, especially for the eCommerce product grids.
