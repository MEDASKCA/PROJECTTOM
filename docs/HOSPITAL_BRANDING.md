# Hospital Branding Guide

PROJECT TOM includes a customizable NHS-compliant hospital header that can be tailored for any NHS Trust or hospital.

## Header Variants

### 1. **Full Branding** (Recommended for production)
Shows NHS logo, trust name, hospital name, department, and custom logo.

### 2. **Minimal Branding** (Default)
Shows basic TOM branding without hospital details.

## Configuration

Add these environment variables to customize the header:

```bash
# Hospital/Trust Branding
NEXT_PUBLIC_HOSPITAL_NAME=Royal Hospital
NEXT_PUBLIC_TRUST_NAME=NHS Foundation Trust
NEXT_PUBLIC_DEPARTMENT_NAME=Theatre Operations
NEXT_PUBLIC_HOSPITAL_LOGO_URL=https://example.com/logo.png
```

## Examples

### Example 1: Large Teaching Hospital

```bash
NEXT_PUBLIC_HOSPITAL_NAME=St Mary's Hospital
NEXT_PUBLIC_TRUST_NAME=Imperial College Healthcare NHS Trust
NEXT_PUBLIC_DEPARTMENT_NAME=Theatre Operations
NEXT_PUBLIC_HOSPITAL_LOGO_URL=https://cdn.example.com/stmarys-logo.png
```

**Result:**
```
┌─────────────────────────────────────────────────────┐
│ NHS | Imperial College Healthcare NHS Trust         │
├─────────────────────────────────────────────────────┤
│ [Logo] St Mary's Hospital              [TOM Badge] │
│        Theatre Operations                           │
└─────────────────────────────────────────────────────┘
```

### Example 2: District General Hospital

```bash
NEXT_PUBLIC_HOSPITAL_NAME=Southmead Hospital
NEXT_PUBLIC_TRUST_NAME=North Bristol NHS Trust
NEXT_PUBLIC_DEPARTMENT_NAME=Surgical Services
NEXT_PUBLIC_HOSPITAL_LOGO_URL=https://cdn.example.com/southmead-logo.png
```

### Example 3: Specialist Hospital

```bash
NEXT_PUBLIC_HOSPITAL_NAME=Royal Brompton Hospital
NEXT_PUBLIC_TRUST_NAME=Guy's and St Thomas' NHS Foundation Trust
NEXT_PUBLIC_DEPARTMENT_NAME=Cardiac Theatres
```

### Example 4: Community Hospital (Minimal Branding)

```bash
# Leave all hospital variables empty for minimal header
# NEXT_PUBLIC_HOSPITAL_NAME=
# NEXT_PUBLIC_TRUST_NAME=
```

**Result:** Simple TOM header without hospital branding

## Design Specifications

### Colors (NHS Brand Guidelines)

- **NHS Blue**: `#005EB8` - Main header background
- **NHS Dark Blue**: `#003087` - Top NHS bar
- **NHS Yellow**: `#FFB81C` - Accent border and TOM badge
- **White**: `#FFFFFF` - Text and logo background

### Header Structure

```
┌──────────────────────────────────────────────┐
│ NHS Bar (Dark Blue)                          │
│  NHS | Trust Name                            │
├──────────────────────────────────────────────┤
│ Main Header (NHS Blue)                       │
│  [Logo] Hospital Name           [TOM Badge]  │
│         Department                           │
└──────────────────────────────────────────────┘
│ Yellow accent border (4px)                   │
```

### Logo Requirements

**Recommended:**
- Format: PNG with transparent background
- Size: 48x48px to 96x96px
- Aspect ratio: Square or rectangular
- Background: Transparent or white
- Color: Trust brand colors

**Example URLs:**
- CDN hosted: `https://cdn.yourcdn.com/hospital-logo.png`
- Vercel blob storage: `https://yourapp.vercel.app/_next/static/media/logo.png`
- External: `https://www.hospital.nhs.uk/logo.png`

## Component Usage

### Programmatic Usage

```tsx
import HospitalHeader from '@/components/HospitalHeader';

// Use with environment variables (recommended)
<HospitalHeader />

// Override with props
<HospitalHeader
  hospitalName="Custom Hospital"
  trustName="Custom NHS Trust"
  department="Custom Department"
  logoUrl="/custom-logo.png"
  showNHSLogo={true}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hospitalName` | `string` | env var | Hospital name to display |
| `trustName` | `string` | env var | NHS Trust name |
| `department` | `string` | `"Theatre Operations"` | Department name |
| `logoUrl` | `string` | `undefined` | URL to hospital logo |
| `showNHSLogo` | `boolean` | `true` | Show NHS branding |

## Responsive Design

The header is fully responsive:

- **Desktop (>768px)**: Full layout with logo and all text
- **Tablet (768px)**: Compact layout with smaller text
- **Mobile (<768px)**: Stacked layout, logo above text

## Accessibility

- **Color contrast**: WCAG AAA compliant (NHS Blue on white)
- **Font size**: Minimum 14px for readability
- **Alt text**: Required for logo images
- **Keyboard navigation**: Fully accessible

## Multi-Trust Deployment

For trusts running multiple hospitals, use environment variables per deployment:

### Vercel Branch Deployments

```bash
# main branch → Trust HQ
NEXT_PUBLIC_HOSPITAL_NAME=Trust Headquarters
NEXT_PUBLIC_TRUST_NAME=Multi-Site NHS Trust

# hospital-a branch → Hospital A
NEXT_PUBLIC_HOSPITAL_NAME=Hospital A
NEXT_PUBLIC_TRUST_NAME=Multi-Site NHS Trust

# hospital-b branch → Hospital B
NEXT_PUBLIC_HOSPITAL_NAME=Hospital B
NEXT_PUBLIC_TRUST_NAME=Multi-Site NHS Trust
```

## NHS Brand Guidelines Compliance

This header follows:
- NHS Identity Guidelines 2023
- NHS Digital Service Manual
- NHS Design System principles
- DTAC branding requirements

**References:**
- [NHS Identity Guidelines](https://www.england.nhs.uk/nhsidentity/)
- [NHS Design System](https://service-manual.nhs.uk/)

## Testing

Test your header branding:

```bash
# Set environment variables
export NEXT_PUBLIC_HOSPITAL_NAME="Test Hospital"
export NEXT_PUBLIC_TRUST_NAME="Test NHS Trust"

# Run development server
npm run dev

# Open http://localhost:3000
```

## Production Checklist

Before deploying:
- [ ] Hospital name is correct
- [ ] Trust name matches official NHS records
- [ ] Department name is accurate
- [ ] Logo URL is accessible (test in incognito)
- [ ] Logo loads on slow connections
- [ ] NHS branding follows guidelines
- [ ] Colors match NHS brand palette
- [ ] Mobile layout works correctly
- [ ] All text is legible

---

**🏥 Built for NHS trusts with pride**
