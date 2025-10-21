# HoReCa Finance Suite

A comprehensive Next.js 14 application for restaurant management, featuring pricing calculators, food cost analysis, supplier management, financial planning, and business intelligence reporting.

## 🚀 Features

- **Menu Pricing Calculators**: Restaurant, Online Delivery, and Catering pricing tools
- **Food Cost Management**: Recipe calculations and ingredient cost tracking
- **Competitor Analysis**: Price comparison and market positioning
- **Supplier Management**: Order building and supplier relationship management  
- **Financial Planning**: Budget tracking, breakeven analysis, and scenario planning
- **Business Reports**: Comprehensive analytics and performance insights
- **Menu Export**: Platform-specific menu generation (Foodpanda, Glovo, Uber Eats)
- **Multi-tenant Architecture**: Company-based data isolation with RLS
- **Admin Panel**: User and system management capabilities

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Language**: TypeScript
- **PDF Generation**: jsPDF
- **Email**: Resend

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soup-art-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database setup**
   - Run the SQL script in `supabase_setup.sql` in your Supabase SQL Editor
   - Update your user profile to admin role

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses a multi-tenant architecture with the following key tables:

- `companies` - Organization management
- `profiles` - User management with company association
- `ingredients` & `recipes` - Food cost management
- `competitors` & `competitor_products` - Market analysis
- `suppliers` & `supplier_orders` - Supply chain management
- `budgets` & `financial_scenarios` - Financial planning
- `menu_exports` - Export configurations
- `business_reports` - Analytics storage

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔐 Security Considerations

- **Environment Variables**: Never commit sensitive keys to version control
- **RLS Policies**: All tables implement Row Level Security for data isolation
- **Authentication**: Supabase Auth handles user management and sessions
- **Admin Access**: Admin panel requires explicit role assignment

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main application routes
│   ├── auth/             # Authentication pages
│   └── api/              # API endpoints
├── components/           # React components by feature
├── lib/                 # Business logic and utilities
│   ├── services/        # Service layer for each module
│   ├── hooks/          # Custom React hooks
│   └── supabase/       # Database configuration
├── types/              # TypeScript definitions
└── contexts/           # React context providers
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create service in `lib/services/`
2. Add custom hook in `lib/hooks/`
3. Create components in `components/feature/`
4. Add routes in `app/dashboard/feature/`
5. Update types in `types/index.ts`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase credentials in `.env.local`
2. **Authentication**: Check RLS policies are enabled
3. **Build Errors**: Ensure all TypeScript types are properly defined
4. **Performance**: Monitor Supabase query performance and add indexes as needed

### Error Reporting

The application includes error boundaries for graceful error handling. In production, integrate with services like Sentry for error monitoring.

## 📄 License

This project is proprietary software for restaurant management.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript typing
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for the restaurant industry**