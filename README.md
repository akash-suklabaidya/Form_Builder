# Dynamic Form Builder
A small, friendly React + TypeScript app that lets you build forms visually — add fields, set validations, create derived (computed) fields, reorder everything with drag-and-drop, and save form schemas to localStorage. Built with MUI for quick, clean UI and Redux Toolkit for predictable state.
---

## Table of Contents
- [Demo / Screenshot](#demo--screenshot)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Run](#run)
  - [Build](#build)
- [How to Use](#routes--how-to-use)
---
## Demo / Screenshot
<img width="1366" height="525" alt="image" src="https://github.com/user-attachments/assets/1c0da9ad-5eb1-4050-8187-466a92fa1ce7" />
---

## Features
- Add fields: Text, Number, Textarea, Select, Radio, Checkbox, Date.
- Configure each field: label, default value, required, min/max, pattern, custom rules.
- Create derived fields (computed from other fields using safe expressions).
- Live preview: validations run and derived fields update as you type.
- Reorder fields with drag-and-drop (dnd-kit recommended).
- Save form schemas (not form data) to localStorage so you can open them later.

---

## Tech Stack
- React (hooks)
- TypeScript (strict)
- Material-UI (MUI)
- Redux Toolkit
- dnd-kit for drag & drop

---

## Getting Started

### Prerequisites
- Node.js >= 16
- npm or yarn
- Git

### Install
```bash
git clone <your-repo-url>
cd Form_Builder
npm install
```
### Run
```bash
npm run dev
# open http://localhost:3000
```
### Build
```bash
npm run build
```

## How to Use
### `/create` — Build a Form
- Click **Add new field**
- Click a field to edit its settings in the right panel
- Reorder fields by dragging them
- Enter a unique form name and click **Save Form** to persist the schema

### `/preview` — Test the Form
- Fill out the form and check validations
- Validation errors show inline
- Derived fields are **read-only** and update live as you type

### `/myforms` — Manage Saved Schemas
- View all saved schemas
- Load a schema into the builder or open it in preview mode
