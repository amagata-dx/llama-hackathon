# 🦙 Class Llama - Education AI Platform

An innovative education platform leveraging AI to solve critical challenges in modern education. Class Llama addresses teacher overwork by providing intelligent AI agents that support both students and educators through the LLaMa Hackathon.

## 🌟 Overview

Class Llama consists of multiple AI-powered applications designed to revolutionize education:

1. **Student Dialogue Agent** - Interactive 3D avatar chat for personalized learning
2. **Teacher Observation System** - Voice-enabled observation recording and analysis
3. **Risk Analysis Dashboard** - Real-time student risk assessment and alerts
4. **Monitoring & Support** (In Design) - Comprehensive student monitoring system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn or npm
- SambaNova API key ([Get one here](https://sambanova.ai))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/llama-hackathon.git
cd llama-hackathon
```

2. Install dependencies:
```bash
# Main application (Apps 1 & 3)
yarn install

# App 2 (Teacher Observation System)
cd apps/app2
yarn install
cd ../..
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your SambaNova API key
```

4. Start the applications:
```bash
# Main application (Apps 1 & 3)
yarn dev
# Open http://localhost:5173

# App 2 (in a new terminal)
cd apps/app2
yarn dev
# Open http://localhost:5174
```

## 📱 Applications

### App 1: Student Dialogue Agent
Interactive AI tutor with 3D animated llama avatar that provides personalized learning support.

**Features:**
- 🎤 Voice input with speech recognition
- 🦙 3D animated llama avatar with emotion states
- 💬 Streaming AI responses with natural typing effect
- 🎭 Avatar reactions synchronized with conversation
- 📚 Contextual learning assistance

**Technology:** React, Three.js, SambaNova AI API, Web Speech API

### App 2: Teacher Observation System
Streamlines classroom observation recording with voice input and AI-powered analysis.

**Features:**
- 🎙️ Voice-to-text observation recording
- 🏷️ Automatic tagging with AI analysis
- 👥 Student tracking and categorization
- 💾 Local data persistence with IndexedDB
- 📊 Export functionality for reports
- 🔄 Ollama fallback for offline operation

**Technology:** React, IndexedDB, Ollama (optional), Speech Recognition

### App 3: Risk Analysis Dashboard
Real-time monitoring and risk assessment for early intervention.

**Features:**
- ⚠️ Real-time risk level assessment
- 🔔 Priority-based alert system
- 🎙️ Interview recording interface
- 📝 Action tracking and follow-ups
- 🤖 LLM-powered risk analysis

**Technology:** React, SambaNova AI API, Real-time data processing

### App 4: Monitoring & Support System (Planned)
Comprehensive student support system combining insights from all applications.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI primitives with custom shadcn/ui-inspired components
- **3D Graphics:** Three.js for avatar rendering

### AI/LLM Integration
- **Primary:** SambaNova AI API
  - Meta-Llama-3.3-70B-Instruct
  - Llama-4-Maverick-17B-128E-Instruct
- **Fallback:** Ollama for local LLM support
- **Features:** Streaming responses, context management, error recovery

### Data Storage
- **Client-side:** IndexedDB (IDB) for local persistence
- **Settings:** Browser localStorage
- **Future:** PostgreSQL/Supabase integration planned

### Speech & Audio
- **Recognition:** Web Speech Recognition API
- **Synthesis:** Browser TTS (planned)
- **Audio Processing:** Web Audio API (planned)

## 📁 Project Structure

```
llama-hackathon/
├── src/                      # Main application source
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI primitives
│   │   ├── layout/          # Layout components
│   │   └── observation/     # App-specific components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and API clients
│   └── assets/              # Static assets
├── apps/
│   └── app2/                # Teacher Observation App
│       └── src/             # App2 source code
├── public/                  # Public static files
├── docs/                    # Documentation
│   ├── japanese/           # Japanese documentation
│   └── images/             # Screenshots and diagrams
└── tests/                   # Test files (planned)
```

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Required - SambaNova API Key
VITE_LLAMA_API_KEY=your_sambanova_api_key_here

# Optional - Ollama Configuration (for App2)
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
VITE_OLLAMA_ENABLED=true

# Optional - Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_3D_AVATAR=true
```

## 📜 Available Scripts

### Main Application
```bash
yarn dev        # Start development server
yarn build      # Build for production
yarn preview    # Preview production build
yarn lint       # Run ESLint
yarn type-check # Run TypeScript checks
```

### App2 (Teacher Observation)
```bash
cd apps/app2
yarn dev        # Start development server
yarn build      # Build for production
yarn preview    # Preview production build
```

## 🔌 API Integration

### SambaNova Setup
1. Sign up at [SambaNova Cloud](https://sambanova.ai)
2. Generate an API key from your dashboard
3. Add the key to your `.env` file
4. The platform supports streaming responses by default

### Ollama Setup (Optional - for offline support)
1. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve`
4. Enable in `.env`: `VITE_OLLAMA_ENABLED=true`

## 🎯 Use Cases

### For Students
- Personalized tutoring sessions
- Homework assistance
- Concept explanations
- Practice problems
- Emotional support

### For Teachers
- Efficient observation recording
- Student behavior tracking
- Risk identification
- Intervention planning
- Progress monitoring

### For Administrators
- School-wide risk assessment
- Resource allocation insights
- Intervention effectiveness tracking
- Compliance reporting

## 🚧 Known Limitations

- No authentication system implemented yet
- API keys are exposed to client (backend proxy recommended for production)
- No data persistence across sessions (except App2)
- Speech recognition requires HTTPS in production
- Three.js performance considerations for lower-end devices

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Student dialogue agent with 3D avatar
- ✅ Teacher observation recording system
- ✅ Risk analysis dashboard
- ✅ App switcher interface

### Phase 2 (Next Sprint)
- [ ] User authentication and authorization
- [ ] Backend API with secure key management
- [ ] Real-time collaboration features
- [ ] WebSocket integration for live updates

### Phase 3 (Future)
- [ ] Mobile applications (React Native)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Integration with school management systems

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Maintain consistent formatting with Prettier
- Write meaningful commit messages

## 📚 Documentation

- [Japanese Documentation](./docs/japanese/) - 日本語の詳細ドキュメント
- [API Documentation](./docs/API.md) - API integration details
- [Component Documentation](./docs/COMPONENTS.md) - UI component library

## 🐛 Troubleshooting

### Common Issues

**Speech recognition not working:**
- Ensure you're using Chrome or Edge browser
- Check microphone permissions
- For production, ensure HTTPS is enabled

**3D Avatar not rendering:**
- Check WebGL support in your browser
- Try disabling hardware acceleration
- Check console for Three.js errors

**API connection issues:**
- Verify your API key is correct
- Check network connectivity
- Look for rate limiting errors

**App2 data not persisting:**
- Check IndexedDB support in browser
- Clear browser cache and try again
- Check browser storage quota

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ for the LLaMa Hackathon by our dedicated team solving real education challenges.

## 🙏 Acknowledgments

- SambaNova for providing the AI infrastructure
- Meta for the LLaMa models
- The open-source community for the amazing tools
- Teachers and students who inspired this solution

---

📧 **Contact:** For questions or support, please open an issue on GitHub.

🌐 **Demo:** [Live Demo Link](https://your-demo-url.com) (Coming soon)

📹 **Video:** [Project Presentation](https://your-video-url.com) (Coming soon)