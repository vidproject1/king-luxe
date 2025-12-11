# 🚀 Luxury E-Commerce Site - Setup Guide

## Step 1: Set up Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Name your project (e.g., "luxury-ecommerce")
   - Set a secure database password
   - Choose a region close to you
   - Click "Create new project"

3. **Get Your API Credentials**
   - Go to Settings → API
   - Copy the "URL" (this is your `VITE_SUPABASE_URL`)
   - Copy the "anon" public key (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 2: Configure Environment Variables

1. **Edit the `.env` file**
   ```bash
   # Replace these values with your actual Supabase credentials
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Save the file**

## Step 3: Set up the Database

1. **Run the SQL Migration**
   - Go to your Supabase dashboard
   - Click on the SQL Editor in the left sidebar
   - Click "New query"
   - Copy and paste the entire contents of `supabase/migrations/001_cms_schema.sql`
   - Click "Run" or press Ctrl+Enter (⌘+Enter on Mac)

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Step 5: Start Building Your Site

1. **Access the Admin Dashboard**
   - Go to `http://localhost:3000/admin`
   - Or click the "Go to Admin" button on the main page

2. **Add Components**
   - Drag components from the left sidebar to the canvas
   - Start with the Navigation Bar as requested
   - Components are automatically saved to Supabase

3. **View Your Main Site**
   - Go to `http://localhost:3000`
   - See your published changes in real-time

## 🔧 Troubleshooting

### Error: "supabaseUrl is required"
- Make sure your `.env` file exists and has the correct values
- Ensure the variable names match exactly:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Database Connection Issues
- Verify your Supabase project is active
- Check that the SQL migration ran successfully
- Ensure RLS policies are properly set up

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run with verbose logging
npm run dev -- --debug
```

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx    # Drag-and-drop CMS interface
│   │   └── MainPage.jsx          # Public-facing website
│   ├── lib/
│   │   └── supabase.js           # Supabase client configuration
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── supabase/
│   └── migrations/
│       └── 001_cms_schema.sql    # Database schema
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
└── vite.config.js               # Vite configuration
```

## 🎯 Next Features to Implement

- User authentication system
- Component configuration panels
- E-commerce functionality (products, cart, checkout)
- Image upload and media management
- Mobile responsive design
- Theme customization
- SEO optimization

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase credentials
3. Ensure the database schema was applied correctly
4. Check that all dependencies are installed

Happy building! 🚀