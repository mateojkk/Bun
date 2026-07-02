# Original User Request

## Initial Request — 2026-07-01T09:22:03Z

# Teamwork Project Prompt

Redesign the Bun platform's landing page and main application UI to match the sleek, premium, minimal aesthetic of plasma.org while maintaining our current content. 

Working directory: ~/basement/Bun
Integrity mode: demo

## Requirements

### R1. Implement Plasma.org Design System
Extract the color palette (stark blacks, clean whites, muted grays, subtle green accents), typography (Inter/Geist), large spacing, and component styling from the provided plasma.org screenshots. Apply them globally via Tailwind configuration and CSS variables.

### R2. Restyle the Landing Page
Rebuild the landing page using Plasma's exact visual style, but retain our current product content (Escrow, ZK Verifier, Developer SDK). Use the hero layouts, feature grids, and dark-themed footer shown in the screenshots as architectural references.

### R3. Update Main Application
Apply the new design system to the existing main application (`/(app)` routes) so the transition from landing page to dashboard feels seamless and premium. Ensure existing UI components are reviewed and cleanly restyled without breaking their functional logic.

## Acceptance Criteria

### Aesthetic & Implementation Checks
- [ ] A dedicated UI verification agent has reviewed the final layout and confirmed the primary color palette strictly adheres to the Plasma reference (avoiding default generic Tailwind blues/reds).
- [ ] The landing page content retains references to Bun's core functionality (Escrow, SDK, etc.) rather than placeholder text.
- [ ] The `/(app)` dashboard components share the exact same typography and border-radius styles as the new landing page.
