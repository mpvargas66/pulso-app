# 🔧 PULSO v2 - Setup Guide

Guía paso a paso para tener PULSO corriendo en producción.

## Requisitos Previos

- [ ] Git instalado
- [ ] GitHub account (repo ya existe: mpvargas66/pulso-app)
- [ ] Vercel account (gratuita en vercel.com)
- [ ] Supabase account (gratuita en supabase.com)
- [ ] Anthropic API key (de Anthropic)

## Fase 1: Setup Supabase (5 minutos)

### 1.1 Crear Project
1. Ve a [supabase.com](https://supabase.com) → Sign Up
2. Click "New Project"
3. Datos:
   - Name: `pulso-v2`
   - Database Password: Guarda bien (no la necesitaremos después)
   - Region: `sa-east-1` (São Paulo, cercano a Chile)
4. Espera a que se cree (~2 minutos)

### 1.2 Obtener DATABASE_URL
1. Project settings (engranaje abajo a la izq.)
2. Tab "Database"
3. Bajo "Connection string", selecciona "URI"
4. Copia el string (empieza con `postgresql://...`)
5. **Guarda en lugar seguro** (la usaremos en Vercel)

### 1.3 Ejecutar Schema SQL
1. En el Supabase dashboard, click "SQL Editor" (lado izq.)
2. Click "+ New Query"
3. Copia TODO el contenido de `/db/schema.sql` del repo
4. Pégalo en el editor
5. Click "Run" (esquina derecha)
6. ✅ Listo: 5 tablas + 60 registros de prueba creados

---

## Fase 2: Setup Vercel (5 minutos)

### 2.1 Conectar GitHub
1. Ve a [vercel.com](https://vercel.com) → Sign Up (con GitHub)
2. Autoriza Vercel para acceder a tu GitHub

### 2.2 Importar Proyecto
1. En Vercel dashboard, click "Add New..." → "Project"
2. Selecciona repo `mpvargas66/pulso-app`
3. Click "Import"
4. **IMPORTANTE**: Configurar Environment Variables (siguiente sección)

### 2.3 Agregar Environment Variables
1. En el formulario de import, expandir "Environment Variables"
2. Agrega estos 4:

| Nombre | Valor | De dónde |
|--------|-------|----------|
| `DATABASE_URL` | `postgresql://...` | De Supabase (Fase 1.2) |
| `ANTHROPIC_API_KEY` | `sk-...` | De Anthropic |
| `NEXTAUTH_URL` | `https://pulso-xxx.vercel.app` | Tu URL (se genera después) |
| `NEXTAUTH_SECRET` | (genera con comando abajo) | Genera local |

**Generar NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```
Copia el output (ej: `LXHWHamek/vwwgKcHb+GTKoVSYc970N//+NotN7P1iM=`)

### 2.4 Deploy
1. Click "Deploy"
2. Vercel compilará (espera ~3-5 minutos)
3. Cuando termine, verás URL: `https://pulso-xxx.vercel.app`
4. Copia esa URL → agrégala a env var `NEXTAUTH_URL` en Vercel settings

### 2.5 Actualizar NEXTAUTH_URL
1. En Vercel project, click "Settings" (arriba)
2. Tab "Environment Variables"
3. Busca `NEXTAUTH_URL`
4. Click edit
5. Reemplaza con tu URL real (ej: `https://pulso-abc123.vercel.app`)
6. Click "Save"
7. Vercel re-desplegará automático (espera ~2 min)

---

## Fase 3: Testing (5 minutos)

### 3.1 Acceder a la app
1. Ve a tu URL Vercel: `https://pulso-xxx.vercel.app`
2. Deberías ver landing page con botones "Registrarse" / "Ingresar"

### 3.2 Registrar usuario de prueba
1. Click "Registrarse"
2. Datos:
   - Nombre: "Test User"
   - Email: "test@pulso.cl"
   - Password: "Test1234!"
3. Click "Crear Cuenta"
4. Auto-redirecta a dashboard

### 3.3 Crear análisis de prueba
1. En dashboard, llena form:
   - Salario Actual: 3500000
   - Años Experiencia: 5
   - Cargo: Software Engineer
   - Industria: Technology
   - Nivel Educativo: Profesional
   - Tamaño Empresa: Grande
2. Click "Calcular Análisis"
3. ✅ Deberías ver resultados con brecha salarial

### 3.4 Verifica historial
1. Click tab "Historial"
2. Deberías ver el análisis que acabas de crear
3. Click en él para ver detalles completos

---

## ✅ Checklist Final

- [ ] Supabase project creado
- [ ] Schema SQL ejecutado en Supabase
- [ ] Vercel project importado
- [ ] 4 env vars configuradas en Vercel
- [ ] NEXTAUTH_URL actualizado con URL real
- [ ] App accesible en `https://pulso-xxx.vercel.app`
- [ ] Usuario de prueba registrado
- [ ] Análisis de prueba creado exitosamente
- [ ] Historial muestra el análisis

---

## 🚀 Desarrollo Futuro

### Git Workflow (sin desarrollo local)
1. **Push a GitHub**: Solo cambios en código
2. **Vercel Hook**: Automáticamente detecta push
3. **Build + Deploy**: ~3-5 minutos

### Comandos Git (desde cualquier lugar)
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit con mensaje
git commit -m "Descripción del cambio"

# Push a GitHub
git push origin main

# Vercel deploy automático ✅
```

---

## 📞 Soporte

Si algo falla:

1. **Error de Database**: Verifica DATABASE_URL en Supabase
2. **Error de Auth**: Regenera NEXTAUTH_SECRET
3. **Error de API**: Abre DevTools (F12) → Console para ver errores
4. **Deploy lento**: Espera, Vercel tarda ~5 min en primera compilación

---

Última actualización: 2024-01-15
