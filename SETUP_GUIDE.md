# 🚀 PULSO MVP - Setup Guide

## ⚠️ Python Version Issue

**Problema**: Python 3.13 tiene incompatibilidad con `pydantic-core` (dependencia nativa)

**Solución**: Usar Python 3.11 o 3.12

---

## 📝 Quick Setup (5 minutos)

### Step 1: Verificar Python Version

```bash
python3 --version
# Debe mostrar: Python 3.11.x o 3.12.x
# ❌ NO: Python 3.13.x
```

### Step 2: Si tienes Python 3.13, cambia a 3.12

#### Opción A: Con Homebrew (macOS)
```bash
# Instalar Python 3.12
brew install python@3.12

# Verificar
python3.12 --version

# Usar para el proyecto
python3.12 -m venv venv
source venv/bin/activate
```

#### Opción B: Con Conda (cualquier OS)
```bash
# Crear environment con Python 3.12
conda create -n pulso python=3.12
conda activate pulso
```

#### Opción C: Descargar desde python.org
- Ir a: https://www.python.org/downloads/
- Descargar Python 3.12
- Instalar
- Usar `python3.12` en lugar de `python3`

---

## 🔧 Backend Setup

### 1. Crear venv con Python 3.12
```bash
cd /Users/marco/pulso-app/backend

# macOS/Linux
python3.12 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 2. Instalar dependencias
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configurar database
```bash
# Crear database PostgreSQL
createdb pulso

# O si usas psql
psql -U postgres -c "CREATE DATABASE pulso;"

# Cargar schema
psql -U postgres -d pulso < migrations/001_initial_schema.sql
psql -U postgres -d pulso < migrations/002_seed_data.sql
```

### 4. Configurar .env.local
```bash
# Copiar template
cp ../.env.example .env.local

# Editar con tus valores
nano .env.local
```

Valores necesarios:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/pulso
CLAUDE_API_KEY=sk-ant-...  # Obtener de https://console.anthropic.com/
JWT_SECRET=your-secret-key-here
```

### 5. Iniciar servidor
```bash
python main.py
# Server running on http://0.0.0.0:8000
# API docs: http://localhost:8000/api/docs
```

---

## 🎨 Frontend Setup

### 1. Instalar dependencias
```bash
cd /Users/marco/pulso-app/frontend

npm install
# o
npm install --legacy-peer-deps  # Si hay conflictos
```

### 2. Configurar .env.local
```bash
cp ../.env.example .env.local
# Ya tienen valores por defecto, no necesita cambios
```

### 3. Iniciar servidor
```bash
npm run dev
# Server running on http://localhost:3000
```

---

## ✅ Verificación

### Backend
```bash
# En navegador
http://localhost:8000/api/docs

# En terminal
curl http://localhost:8000/health
# Debe retornar: {"status":"healthy",...}
```

### Frontend
```bash
# En navegador
http://localhost:3000

# Debe ver: Landing page con botón "Comienza gratis"
```

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'pydantic'"
**Solución**: Asegúrate que el venv está activado
```bash
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Error: "psycopg2.OperationalError: connection refused"
**Solución**: PostgreSQL no está corriendo
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# O usar Docker
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
```

### Error: "NEXTAUTH_SECRET is not set"
**Solución**: Generar secret
```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid))
```

### npm install falla
**Solución**: Limpiar cache
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📦 Versiones Recomendadas

| Component | Version | Tested |
|-----------|---------|--------|
| Python | 3.11, 3.12 | ✅ |
| Node.js | 18, 20 | ✅ |
| PostgreSQL | 14, 15 | ✅ |
| npm | 9, 10 | ✅ |

---

## 🚀 Primeros Pasos

1. **Crear cuenta**
   - Ir a http://localhost:3000/auth/signup
   - Email: test@example.com
   - Password: TestPass123!

2. **Crear perfil**
   - Llenar formulario de 10 campos
   - Click en "Analizar"

3. **Ver resultados**
   - Verás 4 cards con análisis
   - Peso: 0-1000
   - P50: salario del mercado
   - Brecha: diferencia %
   - Recomendaciones: sugerencias personalizadas

---

## 📞 Soporte

- **Docs**: Ver README.md
- **API**: http://localhost:8000/api/docs
- **Issues**: GitHub Issues
- **Email**: hola@pulso.app

---

**Made with ❤️ by Arauko Labs**
