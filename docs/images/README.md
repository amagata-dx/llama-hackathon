# Documentation Images

This directory contains screenshots and diagrams for the Class Llama documentation.

## Directory Structure

```
images/
├── screenshots/     # Application screenshots
│   ├── app1/       # Student Dialogue Agent
│   ├── app2/       # Teacher Observation System
│   ├── app3/       # Risk Analysis Dashboard
│   └── app4/       # Monitoring & Support
├── diagrams/       # Architecture and flow diagrams
└── demo/           # Demo GIFs and videos
```

## Naming Convention

- Screenshots: `{app}-{feature}-{version}.png`
  - Example: `app1-avatar-chat-v1.png`
- Diagrams: `{type}-{description}.png`
  - Example: `architecture-overview.png`
- Demo GIFs: `{app}-{action}-demo.gif`
  - Example: `app2-voice-recording-demo.gif`

## File Formats

- Screenshots: PNG (preferred) or JPEG
- Diagrams: PNG or SVG
- Demos: GIF or MP4
- Maximum file size: 5MB per file

## Usage

Reference images in markdown files using relative paths:

```markdown
![App1 Avatar Chat](./docs/images/screenshots/app1/avatar-chat-v1.png)
```

## Contributing

When adding new images:
1. Follow the naming convention
2. Optimize images for web (compress if needed)
3. Update this README if adding new categories
4. Include alt text in markdown references for accessibility