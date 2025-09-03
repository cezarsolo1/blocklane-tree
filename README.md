# Blocklane Tenant Intake

A best-in-class, privacy-safe standardized intake where tenants can file unplanned maintenance tickets in ≤ 2 minutes, with strong triage to prevent unnecessary tickets.

## Features

- **Decision Tree Engine**: Pure, modular engine that loads JSON and traverses nodes
- **Wizard UI Renderer**: Stateless UI components for different node types
- **Video Check Nodes**: Interactive video resolution with yes/no outcomes
- **Leaf Node Handling**: Different outcomes based on leaf_type and leaf_reason
- **Navigation**: Breadcrumbs and back/forward navigation
- **"My Option is Missing"**: Rule-based display for leaf children

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components
- **Testing**: Vitest + React Testing Library
- **State Management**: React hooks (useState, useCallback, useMemo)

## Project Structure

```
src/
├── modules/
│   ├── decision-tree/
│   │   ├── engine.ts              # Pure decision tree engine
│   │   └── mock-tree.json         # Mock decision tree data
│   └── wizard/
│       ├── components/
│       │   ├── TreeGrid.tsx       # Grid layout for branch nodes
│       │   ├── VideoCheckNode.tsx # Video check node renderer
│       │   ├── LeafNode.tsx       # Leaf node renderer
│       │   ├── Breadcrumbs.tsx    # Navigation breadcrumbs
│       │   └── WizardRenderer.tsx # Main wizard orchestrator
│       └── hooks/
│           └── useWizard.ts       # Wizard state management
├── components/
│   └── ui/                        # Reusable UI components
├── types/
│   └── decision-tree.ts           # TypeScript type definitions
└── pages/
    └── Wizard.tsx                 # Main wizard page
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase CLI (for local development with Supabase)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blocklane-tenant-intake
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp env.example .env
```

### Backend Options

#### Option A: In-Memory Backend (Default)

For development without Supabase:
```bash
npm run dev
```

#### Option B: Supabase Backend

1. Install Supabase CLI: `npm install -g supabase`
2. Start Supabase locally: `supabase start`
3. Apply database schema: `supabase db reset`
4. Deploy Edge Functions: `supabase functions deploy`
5. Set environment variables:
   ```
   VITE_BACKEND=supabase
   VITE_SUPABASE_URL=your_local_supabase_url
   VITE_SUPABASE_ANON_KEY=your_local_anon_key
   ```
6. Start development server: `npm run dev`

#### Option C: Hosted Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Apply the database schema from `infra/supabase/schema.sql`
3. Deploy Edge Functions:
   ```bash
   supabase link --project-ref your-project-ref
   supabase functions deploy
   ```
4. Configure environment variables with your hosted Supabase credentials
5. Start development server: `npm run dev`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## Decision Tree Structure

The decision tree is defined in JSON format with the following node types:

### Branch Nodes
```json
{
  "node_id": "bathroom",
  "type": "branch",
  "title": { "en": "Bathroom", "nl": "Badkamer" },
  "children": [...]
}
```

### Video Check Nodes
```json
{
  "node_id": "toilet-clog-video",
  "type": "video_check",
  "title": { "en": "Clogged toilet", "nl": "Verstopt toilet" },
  "video_url": "https://youtu.be/xyz",
  "outcomes": {
    "yes": { "leaf_type": "end_no_ticket", "leaf_reason": "video_resolved" },
    "no": { "leaf_type": "start_ticket", "leaf_reason": "video_not_resolved" }
  }
}
```

### Leaf Nodes
```json
{
  "node_id": "tap-leak",
  "type": "leaf",
  "title": { "en": "Leaking tap", "nl": "Lekkende kraan" },
  "leaf_type": "start_ticket",
  "leaf_reason": "standard_wizard",
  "required_fields": ["description", "photos"],
  "flow": ["describe_media", "contact_questions", "review", "submit"],
  "question_groups": ["contact_at_home", "entry_permission"]
}
```

## Leaf Types and Reasons

### Leaf Types
- `end_no_ticket` - No ticket created (problem resolved, tenant responsibility, etc.)
- `start_ticket` - Create a maintenance ticket

### Leaf Reasons
- `emergency` - Emergency situation
- `tenant_responsibility` - Tenant's responsibility to fix
- `video_resolved` - Video helped solve the problem
- `video_not_resolved` - Video didn't help, need ticket
- `standard_wizard` - Standard maintenance ticket
- `safety_issue` - Safety-related issue

## Testing

The project includes comprehensive tests for:

- Decision tree engine functionality
- Wizard state management
- Node navigation and traversal
- Video outcome handling

Run tests with:
```bash
npm test
```

## Development

### Adding New Node Types

1. Update types in `src/types/decision-tree.ts`
2. Add rendering logic in `src/modules/wizard/components/`
3. Update the engine in `src/modules/decision-tree/engine.ts`
4. Add tests in `tests/`

### Modifying the Decision Tree

Edit `src/modules/decision-tree/mock-tree.json` to modify the decision tree structure. The engine will automatically handle the new structure as long as it follows the defined schema.

## TODO

- [ ] Implement video player for video_check nodes
- [ ] Add search functionality with fuzzy matching
- [ ] Implement "My option is missing" logic
- [ ] Add localization support (currently only English)
- [ ] Integrate with Supabase for data persistence
- [ ] Add authentication and user management
- [ ] Implement ticket creation flow
- [ ] Add media upload functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

[Add your license here]
