# PULSO 📊

**Toma el pulso del mercado salarial**

PULSO es una plataforma de análisis salarial impulsada por IA que ayuda a profesionales a entender su valor en el mercado laboral. Completa tu perfil profesional y obtén recomendaciones personalizadas basadas en datos de mercado y algoritmos de análisis.

---

## ✨ Características

- 🎯 **Análisis de Perfil**: Calcula tu peso profesional basado en 8 factores clave
- 📊 **Benchmarks de Mercado**: Compara tu salario contra datos reales del mercado
- 🤖 **Recomendaciones IA**: Obtén sugerencias personalizadas (Claude API)
- 🔐 **Autenticación Segura**: JWT + bcrypt password hashing
- 💾 **Histórico**: Guarda tus análisis y ve tu evolución
- 📱 **Responsive**: Funciona perfectamente en móvil y desktop

---

## 🚀 Quick Start

### Prerrequisitos

- **Node.js** 18+ y **npm** (para frontend)
- **Python** 3.11+ (para backend)
- **PostgreSQL** 14+ (base de datos)
- **Git** (control de versiones)

### Frontend

```bash
# 1. Ir a carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp ../.env.example .env.local
# Editar .env.local si es necesario (defaults funcionan localmente)

# 4. Iniciar servidor de desarrollo
npm run dev
```

Frontend disponible en: **http://localhost:3000**

### Backend

```bash
# 1. Ir a carpeta backend
cd backend

# 2. Crear virtual environment
python -m venv venv

# 3. Activar virtual environment
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Copiar variables de entorno
cp ../.env.example .env.local
# Editar .env.local con tu DATABASE_URL y CLAUDE_API_KEY

# 6. Crear base de datos
psql -U postgres -c "CREATE DATABASE pulso;"

# 7. Cargar schema
psql -U postgres -d pulso < migrations/001_initial_schema.sql
psql -U postgres -d pulso < migrations/002_seed_data.sql

# 8. Iniciar servidor
python main.py
```

Backend disponible en: **http://localhost:8000**
API Docs (Swagger): **http://localhost:8000/api/docs**

---

## 🔧 Environment Setup

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Backend (.env.local)

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/pulso

# API Keys
CLAUDE_API_KEY=sk-ant-your-key-here
JWT_SECRET=your-secret-key-here

# URLs
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Settings
DEBUG=true
ENVIRONMENT=development
LOG_LEVEL=INFO
```

**Obtener API Keys:**
- **Claude API**: https://console.anthropic.com/ (free tier disponible)
- **JWT Secret**: Generar con `openssl rand -base64 32`

---

## 📁 Estructura del Proyecto

```
pulso-app/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout + SessionProvider
│   │   ├── globals.css         # Global styles
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Analysis dashboard
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── [...nextauth]/route.ts
│   │   └── api/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ProfileForm.tsx     # 10 field form
│   │   ├── AnalysisResult.tsx  # Results display
│   │   └── SessionProvider.tsx
│   ├── lib/
│   │   ├── api.ts              # Axios + postAnalysis()
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .env.local
│   └── .gitignore
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py             # FastAPI app + routes
│   │   ├── config.py           # Settings (BaseSettings)
│   │   ├── database.py         # SQLAlchemy engine
│   │   ├── models.py           # 5 DB models
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── routes/
│   │   │   ├── auth.py         # /auth endpoints
│   │   │   ├── profiles.py     # /profiles endpoints
│   │   │   ├── analyses.py     # /analyses endpoints
│   │   │   └── benchmarks.py   # /benchmarks endpoints
│   │   └── services/
│   │       ├── pesaje.py       # PesajeMotor (8 factors)
│   │       └── claude_api.py   # Claude integration
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # Tables + indexes
│   │   └── 002_seed_data.sql       # Factor weights + benchmarks
│   ├── requirements.txt
│   ├── main.py
│   ├── .env.local
│   └── .gitignore
│
├── .env.example                # Environment reference
├── .gitignore                  # Git exclusions
└── README.md                   # This file
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Profiles
- `GET /api/profiles/me/profile` - Get current user profile
- `POST /api/profiles` - Create profile
- `GET /api/profiles/{id}` - Get public profile
- `GET /api/profiles/me/profiles` - List user profiles
- `DELETE /api/profiles/{id}` - Delete profile

### Analysis
- `POST /api/analyses` - Create salary analysis
- `GET /api/analyses` - List user analyses
- `GET /api/analyses/{id}` - Get specific analysis
- `DELETE /api/analyses/{id}` - Delete analysis

### Benchmarks
- `GET /api/benchmarks` - Search benchmarks
- `GET /api/benchmarks/{id}` - Get benchmark details
- `GET /api/search/byindustry` - Filter by industry
- `GET /api/industries/list` - List all industries

### Health
- `GET /health` - Health check
- `GET /` - API info

---

## 🗄️ Database Schema

### Tables
1. **users** - User accounts (email, password_hash, plan)
2. **profiles** - Professional profiles (8 fields)
3. **analyses** - Analysis results (peso, p50, brecha, recommendations)
4. **salary_benchmarks** - Market salary data (60 seed records)
5. **factor_weights** - Algorithm weights (8 factors)

### Indexes
- `users`: email, email_active, created_at
- `profiles`: user_id, industria_tamaño, peso
- `analyses`: user_id, profile_id, brecha
- `benchmarks`: cargo_nombre, industria_tamaño_region, peso

---

## 🧮 Análisis Algorithm

El peso del perfil se calcula combinando 8 factores:

| Factor | Peso | Descripción |
|--------|------|-------------|
| Complejidad Intelectual | 25% | Technical depth, specialized skills |
| Liderazgo | 20% | Team management, leadership |
| Autonomía | 15% | Decision-making authority |
| Seniority | 15% | Career level (Junior/Mid/Senior/Staff) |
| Mercado | 10% | Industry demand |
| Impacto | 10% | Business impact scope |
| Contexto | 4% | Company size |
| Educación | 1% | Formal education |

**Resultado**: Peso normalizado 0-1000

---

## 📈 Status: MVP en Desarrollo

### ✅ Completado (Sprint 1)
- [x] Frontend landing page
- [x] Authentication (signup/login/logout)
- [x] Profile form (10 fields)
- [x] Analysis engine (8 factors)
- [x] Salary benchmarks (60 records)
- [x] Results visualization
- [x] Backend API (4 routers)
- [x] Database schema + seed data
- [x] JWT authentication
- [x] Password hashing (bcrypt)

### 🔄 En Desarrollo (Sprint 2)
- [ ] Claude API integration (Phase 2)
- [ ] Advanced benchmarks UI
- [ ] User analytics dashboard
- [ ] Export results (PDF)
- [ ] Mobile app (React Native)

### 📋 Roadmap (Sprint 3+)
- [ ] Social comparison (anónimo)
- [ ] Job recommendations
- [ ] Salary negotiation guide
- [ ] Industry reports
- [ ] Team salary analysis (HR)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **UI**: React 18 + Tailwind CSS
- **Auth**: NextAuth.js 5 + JWT
- **HTTP**: Axios
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0
- **Auth**: JWT + bcrypt
- **AI**: Anthropic Claude API
- **Validation**: Pydantic v2

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
pytest
```

---

## 🚢 Production Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
pip install gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

---

## 📞 Support

- 📧 Email: hola@pulso.app
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Marco Vargas**
- GitHub: [@marcovargas](https://github.com)
- Email: marco.vargas.puebla@gmail.com
- Location: Santiago, Chile

---

## 🙏 Acknowledgments

- Anthropic for Claude API
- Next.js community
- FastAPI community
- PostgreSQL team

---

**Made with ❤️ by Arauko Labs**

*Empoderando profesionales con datos de salario reales.*
