HouseKey Web

This is the web application for HouseKey, a home management application.

## Description

HouseKey is a tool to manage your home, including tasks, shopping lists, a calendar, and more. This repository contains the source code for the web-based client.

## Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **Backend:** Supabase
- **Styling:** Tailwind CSS
- **State Management:** Zustand

## Features

- **Task Management:** Create, assign, and track household tasks.
- **Shopping Lists:** Shared shopping lists for your household.
- **Calendar:** A shared calendar for household events.
- **Real-time Updates:** Uses Supabase for real-time data synchronization.

## Getting Started

To get started with development, you will need to have Node.js and yarn installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/housekey-web.git
   ```
2. **Install dependencies:**
   ```bash
   yarn install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root of the project and add your Supabase URL and anon key:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. **Start the development server:**
   ```bash
   yarn dev
   ```

For more detailed usage instructions, please see the [USAGE.md](USAGE.md) file.

## Contributing

This project is a work in progress. If you would like to contribute, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

