# SeedGuard v2.0 - Professional PMO Tracking App

## 🌱 What's New

This is a complete professional redesign and refactor of SeedGuard, transforming it from a basic tracker into a premium, modern productivity app with:

### ✨ Key Improvements

#### **Unified Sidebar System** ✅
- **Consistent Styling**: Identical, professional design across all pages
- **Active Page Highlighting**: Smart detection of current page with neon visual feedback
- **Mobile Responsive**: Hamburger menu on mobile, collapsible drawer navigation
- **Smooth Animations**: Transition effects for all interactions
- **Reusable Component**: Single `Sidebar` component shared across entire app
- **Premium Look**: Glass-morphism effects, neon accents, modern spacing

#### **Modern UI/UX Design** ✅
- **Dark Theme**: Optimized for focus and reduced eye strain
- **Neon Accents**: Magenta (#FF00FF) and Cyan (#00FFFF) for visual hierarchy
- **Smooth Animations**: Fade-in, scale, and slide transitions throughout
- **Premium Typography**: Bold, uppercase titles with tracking for impact
- **Responsive Grid System**: Perfect on desktop (1280px+), tablet (768px+), and mobile
- **Glassmorphism**: Subtle frosted glass effects for depth

#### **Enhanced Dashboard** ✅
- **Live Statistics**: Current streak, total days, longest streak, relapses
- **Animated Cards**: Staggered scale-in animations on page load
- **Quick Actions**: Log victory or check history from dashboard
- **Motivational Content**: Encouraging messages throughout
- **Color-Coded Metrics**: Different colors for different stat types

#### **Advanced History Page** ✅
- **Entry Logging**: Add victories or relapse notes with timestamps
- **Dual Tracking**: Separate sections for wins and challenges
- **Session Statistics**: Calculate success rates, streak analysis
- **Easy Deletion**: Hover to reveal delete button on each entry
- **localStorage Support**: All data persists locally

#### **Professional Settings Page** ✅
- **Preferences Management**: Toggle notifications, sounds, auto-backup
- **Data Export**: Download backup as JSON file
- **Clear Data Option**: Secure data clearing (with confirmation)
- **About Section**: Version info and privacy statement
- **Theme Controls**: Dark/light mode toggle

#### **Beautiful Onboarding Flow** ✅
- **3-Step Wizard**: Welcome, preferences, confirmation
- **Progress Indicator**: Visual progress bar
- **Smooth Transitions**: Fade animations between steps
- **Optional Setup**: Skip onboarding to jump to dashboard
- **Personal Data**: Optional name and goal preferences

#### **Retention Journey Page** ✅
- **Benefits Timeline**: 6 major benefits of recovery
- **Phase Breakdown**: 4 detailed recovery phases (Week 1, Weeks 2-4, Months 2-3, Months 3+)
- **Symptoms Guide**: What to expect at each stage
- **Motivational Content**: Powerful messaging and encouragement
- **Visual Hierarchy**: Color-coded phases for clarity

### 🎨 Design System

#### Colors
- **Primary (Magenta)**: `hsl(300, 100%, 50%)` - Main actions, highlights
- **Secondary (Cyan)**: `hsl(180, 100%, 50%)` - Alternative highlight
- **Destructive (Red)**: `hsl(0, 100%, 50%)` - Danger/relapse states
- **Accent (Purple)**: `hsl(280, 100%, 50%)` - Secondary actions
- **Background**: `hsl(0, 0%, 3%)` - Deep dark for reduced eye strain
- **Muted**: `hsl(0, 0%, 20%)` - Borders and inactive states

#### Typography
- **Font**: Geist (sans-serif) and Geist Mono
- **Sizing**: Responsive scaling (16px base)
- **Weight**: Mix of regular (400) and bold (700)
- **Tracking**: Increased letter spacing on headings for impact

#### Animations
- **Fade In/Out**: 300ms ease-in-out
- **Slide**: 300ms ease-out (from sides)
- **Scale**: 300ms ease-out (from center)
- **Bounce**: Subtle 2s infinite for loading states
- **Stagger**: 50ms between repeated animations

### 📁 Project Structure

```
seedgaurd-tracker/
├── app/
│   ├── (dashboard)/                  # Layout group
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard page
│   │   ├── history/
│   │   │   └── page.tsx             # History & analytics
│   │   ├── benefits/
│   │   │   └── page.tsx             # Retention journey
│   │   ├── settings/
│   │   │   └── page.tsx             # User settings
│   │   └── layout.tsx               # Dashboard layout with sidebar
│   ├── onboarding/
│   │   └── page.tsx                 # Onboarding flow
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── components/
│   └── sidebar.tsx                  # Unified sidebar component
├── public/
│   ├── favicon.ico                  # App icon
│   └── [images]                     # Static assets
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── next.config.js                  # Next.js config
├── .eslintrc.json                  # ESLint config
└── README.md                        # This file
```

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm or yarn

#### Installation

```bash
# Navigate to project directory
cd seedgaurd-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

#### Building for Production

```bash
# Build the app
npm run build

# Start production server
npm start

# Or export as static HTML (for GitHub Pages)
npm run export
# Output will be in the 'out' directory
```

### 📦 Key Technologies

- **Next.js 15**: React framework with file-based routing
- **React 19**: Modern component library
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **localStorage**: Client-side persistent storage (no backend needed)

### 🎯 Features

#### Current Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode optimized
- ✅ Smooth animations and transitions
- ✅ Offline-first (uses localStorage)
- ✅ No tracking or analytics
- ✅ Privacy-first architecture
- ✅ Modern neon-themed UI
- ✅ Touch-friendly mobile interface

#### Data Storage
All user data is stored locally in the browser using localStorage:
- `seedguard_stats`: Streak and progress statistics
- `seedguard_history`: Log entries (victories and relapses)
- `seedguard_settings`: User preferences
- `seedguard_user`: Onboarding preferences

### 🔒 Privacy & Security

- **No Backend Required**: App works completely offline
- **Local Storage Only**: All data stays on your device
- **No Analytics**: We don't track you
- **No Account System**: No login or registration needed
- **No Data Collection**: Your recovery journey is private

### 📱 Responsive Breakpoints

- **Mobile**: < 768px (full-width menu, hamburger nav)
- **Tablet**: 768px - 1024px (optimized layout)
- **Desktop**: ≥ 1024px (sidebar always visible)

### ⚙️ Configuration

#### Tailwind CSS
Customizable via `tailwind.config.ts`:
- Color scheme (CSS variables)
- Animation timings
- Spacing scale
- Responsive breakpoints

#### Next.js
Configured in `next.config.js`:
- `basePath: '/seedgaurd-tracker'` - GitHub Pages subdirectory
- `output: 'export'` - Static export for GitHub Pages
- `trailingSlash: true` - Ensure proper routing

### 🚢 Deployment to GitHub Pages

1. **Build the app**:
   ```bash
   npm run build && npm run export
   ```

2. **Deploy using git**:
   ```bash
   git add .
   git commit -m "Build: Update SeedGuard v2.0"
   git push origin main
   ```

3. **Verify deployment**:
   - Visit: https://faust00.github.io/seedgaurd-tracker/

### 📊 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

### 🛠️ Development

#### Running in Development Mode
```bash
npm run dev
```
Opens http://localhost:3000 with hot reload

#### Linting
```bash
npm run lint
```

#### Building for Production
```bash
npm run build
npm start
```

### 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Components**: Functional with React Hooks
- **Styling**: Tailwind CSS utility classes
- **Icons**: Lucide React for consistency

### 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 🤝 Contributing

Found a bug or have a suggestion? Feel free to:
1. Create an issue
2. Submit a pull request
3. Suggest improvements

### 📄 License

This project is open source. Feel free to use and modify for your needs.

### 🌟 Support

If you find SeedGuard helpful in your recovery journey, please:
- Star this repository ⭐
- Share it with others on your journey
- Support others in their recovery efforts

---

**Made with ❤️ for recovery, freedom, and discipline.**

*"You are stronger than your urges. Your recovery is possible. One day at a time."*
