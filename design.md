<design-system>
# Design Style: Editorial Trust Real Estate

## Design Philosophy

### Core Principle

**Familiarity with Authority.**
This interface should feel instantly usable to anyone who has used NoBroker, 99acres, Housing, or MagicBricks, but it must look far more refined, confident, and premium. The goal is not novelty for its own sake. The goal is trust at first glance, then delight through composition, typography, and controlled asymmetry.

The UI should communicate:

* verified inventory
* transparent pricing
* locality intelligence
* service completeness
* low-risk decision making

Use the language of a serious property advisory platform, not a generic marketplace template.

### Visual Vibe

**Emotional Keywords**: Credible, premium, calm, informed, metropolitan, transparent, editorial, precise, human, confident

This is the visual language of:

* premium property magazines
* financial research dashboards
* luxury advisory platforms
* modern city guides
* architectural editorial layouts

The interface should feel composed and trustworthy, with just enough visual tension to feel alive.

### What This Design Is NOT

* ❌ generic SaaS dashboard styling
* ❌ overly playful startup UI
* ❌ cluttered marketplace clutter
* ❌ flat card grids with no hierarchy
* ❌ default blue-accent “real estate app” visuals
* ❌ cheap gradients or overdone shadows
* ❌ overly rounded or toy-like components
* ❌ sterile, template-looking search pages

### The DNA of the Design

#### 1. Trust-First Search Hero

The hero must be recognizable immediately. Use a dominant search bar, but treat it like a premium control surface, not a basic input. Surround it with high-value quick actions such as Buy, Rent, New Projects, Verified, Near Metro, and Budget.

#### 2. Editorial Asymmetry

Do not center everything evenly. Break the grid intentionally. Use offset cards, layered modules, uneven column widths, and diagonal visual flow. The layout should feel designed, not assembled.

#### 3. Evidence Over Decoration

Trust comes from proof. Surface verified badges, price movement, locality ratings, possession status, commute time, furnishing state, and source labels. Make data visible without making the UI feel busy.

#### 4. Familiar Browsing Patterns

Retain the expected mental model of real estate portals. Users should still find search, filters, map/list toggle, saved searches, locality pages, and comparison tools exactly where they expect them.

#### 5. Premium Typography

Typography should do more than label content. It should carry the visual identity. Use distinctive type choices, elegant contrast, and strong scale shifts to make the interface feel editorial.

#### 6. Structured Density

Some areas should breathe, while others should pack in useful information. Alternate generous negative space with concentrated information blocks so the page feels curated rather than sparse.

#### 7. Subtle Overlap and Layering

Use overlapping cards, partially stacked panels, floating stat chips, and offset sections. Keep the effect disciplined, not decorative.

#### 8. Sharp Confidence

Edges should feel precise and intentional. Avoid soft UI clichés. Use crisp separation, strong alignment, and clear depth hierarchy.

## Design Token System

### Colors

Use a restrained, trust-oriented palette with premium depth.

```
background:       #F7F4EF
surface:          #FFFFFF
surfaceAlt:       #EFE9E1
foreground:       #111111
mutedForeground:  #6B665F
border:           #D8D1C7
borderStrong:     #111111
accent:           #1E3A8A
accentSoft:       #DCE7FF
success:          #16794C
warning:          #A15C1A
danger:           #A11D1D
```

**Palette Rule**:
Use one strong accent only, and use it sparingly. The interface should feel trustworthy, not promotional.

### Typography

**Font Stack**:

* **Display / Headlines**: `"Fraunces", "Cormorant Garamond", Georgia, serif`
* **Body**: `"Source Serif 4", Georgia, serif`
* **UI / Labels**: `"IBM Plex Sans", "Avenir Next", system-ui, sans-serif`
* **Mono / Data**: `"IBM Plex Mono", monospace`

**Reasoning**:

* Fraunces gives personality and elegance without looking generic.
* Source Serif 4 supports long-form readability.
* IBM Plex Sans keeps the interface functional and modern.
* IBM Plex Mono makes pricing, locality stats, and metadata feel precise.

**Type Scale**:

```
xs:   0.75rem
sm:   0.875rem
base: 1rem
lg:   1.125rem
xl:   1.25rem
2xl:  1.5rem
3xl:  2rem
4xl:  2.75rem
5xl:  3.75rem
6xl:  5rem
7xl:  6.5rem
```

**Typography Rules**:

* Headlines should be expressive and slightly condensed in feel.
* Use strong contrast between headline and body.
* Use sentence case for trust and readability.
* Use small caps or uppercase only for metadata and utility labels.

### Border Radius

```
small:  6px
medium: 12px
large: 20px
hero:   28px
```

Do not over-round everything. Reserve larger radius for hero surfaces and high-emphasis modules. Utility elements should remain crisp.

### Borders & Depth

```
hairline:  1px solid #D8D1C7
standard:  1px solid #111111
strong:    2px solid #111111
heavy:     4px solid #111111
```

Depth must come from:

* layering
* overlap
* border contrast
* scale contrast
* background shifts

Avoid heavy shadows. Use minimal elevation or none at all.

## Component Stylings

### Buttons

**Primary Button**

* Background: strong accent or black
* Text: white
* Shape: rounded medium, not pill-like
* Padding: generous
* Label: clear and action-oriented
* Hover: slight inversion or border reinforcement
* Copy examples: Search Properties, View Verified Homes, Compare Localities

**Secondary Button**

* White surface
* Strong border
* Dark text
* Hover: subtle surface tint, not glow

**Tertiary Button**

* Text-only or underlined
* Used for filters, saved searches, and supporting actions

### Search Bar

The search bar should be the visual anchor.

Include:

* location field
* buy or rent toggle
* property type chips
* budget control
* optional map toggle
* recent searches
* locality suggestions

The search module should feel like a premium planning tool, not a plain input field.

### Property Cards

Every card should contain:

* property title
* location
* price
* listing type
* verified or source badge
* key stats
* commute or locality insight
* save and compare actions

Card hierarchy:

1. image or plan panel
2. trust badges
3. title and price
4. locality intelligence
5. action row

Use slightly asymmetrical card internals so the grid feels curated.

### Trust Modules

Create compact trust surfaces for:

* verified listings
* owner direct
* broker assistance
* no brokerage
* price trend
* locality score
* possession timeline
* legal assistance
* loan assistance

These modules should look like editorial facts, not marketing claims.

### Filters

Filters should be visible, not hidden.
Use:

* chips
* segmented controls
* drawer filters on mobile
* sticky filter bar on desktop

High-value filters:

* budget
* property type
* furnishing
* verified status
* possession
* locality
* metro distance
* builder or owner
* balcony count
* parking
* pet friendly

### Data Surfaces

Market intelligence should be presented like a research report.

Include modules for:

* average price
* rental range
* price trend
* locality sentiment
* demand vs supply
* commute score
* nearby infrastructure
* school and hospital proximity

## Layout Strategy

### Hero

The hero should use a strong asymmetrical composition:

* left side: headline and search
* right side: stacked trust panels or featured listing cards
* one oversized data number or locality insight
* one diagonal or offset visual break

The hero must feel confident, spacious, and editorial.

### Section Flow

Recommended structure:

1. Hero search
2. Trust chips and proof points
3. Featured listings with strong visual hierarchy
4. Locality intelligence
5. Comparison and calculators
6. Services and guidance
7. Saved searches and alerts
8. Final conversion panel

### Grid Behavior

Use a 12-column structure, but break it deliberately:

* 7/5 split in hero
* 8/4 split in research sections
* offset cards in recommendation sections
* one hero card may bleed beyond the main grid slightly

### Negative Space

Allow breathing room around premium areas.
Use denser layouts only when presenting research or comparison data.

## Effects & Motion

### Motion Philosophy

Motion should feel deliberate and premium. No playful movement. No bounce. No novelty animation.

### Allowed Motion

* hover tint shifts
* card border reinforcement
* smooth filter panel reveal
* subtle overlap transitions
* image reveal on feature cards
* lightweight count-up animation for stats

### Prohibited Motion

* excessive parallax
* floating buttons
* springy movement
* decorative drifting effects
* neon glow transitions

### Interaction Feedback

**Hover**

* cards lift slightly or change border weight
* trust badges invert or darken
* comparison actions become more prominent

**Focus**

* strong visible focus ring
* clear keyboard navigation
* no hidden or ambiguous states

## Iconography

Use thin, well-drawn outline icons.
Keep them consistent and restrained.

Examples:

* location pin
* shield for verification
* chart icon for price trend
* ruler for area
* train for metro proximity
* heart for save
* balance scale for compare

Icons should support the interface, not decorate it.

## Responsive Strategy

### Mobile

The mobile version must keep the same trust logic.

* sticky search bar
* compact filter chips
* stacked trust modules
* swipeable cards
* bottom compare bar
* visible saved search entry points

### Desktop

Use more editorial tension:

* layered hero
* side rail insights
* asymmetrical card masonry
* overlapping stat panels
* wider comparison tables

## Accessibility

* Maintain strong contrast
* Keep touch targets large
* Ensure all search and filter controls are reachable by keyboard
* Use clear labels, not icon-only actions
* Make trust states explicit, not implied

## Bold Choices

1. **Make the search module oversized and premium**
2. **Use asymmetry to avoid a default portal feel**
3. **Show proof, not marketing**
4. **Use distinctive serif-led typography**
5. **Layer cards and panels with controlled overlap**
6. **Keep the UI familiar enough to trust immediately**
7. **Make data surfaces feel like research, not ads**
8. **Let one or two modules break the grid**
9. **Use a strong accent sparingly**
10. **Make locality intelligence as important as listings**

## What Success Looks Like

A successful design should feel like:

* a premium real estate advisory platform
* a trusted property marketplace
* an editorial city intelligence product
* a modern property search experience that feels familiar on first use

It should not feel like:

* a generic listing website
* a startup dashboard
* a coupon marketplace
* a noisy ad-driven portal

  </design-system>