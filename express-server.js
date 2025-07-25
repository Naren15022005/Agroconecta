const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta para servir el formulario HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'nextjs-form.html'));
});

app.get('/agricultor/publicar', (req, res) => {
  res.sendFile(path.join(__dirname, 'nextjs-form.html'));
});

app.get('/auth/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro-form.html'));
});

// API de categorías
app.get('/api/categorias', async (req, res) => {
  try {
    console.log('Solicitando categorías...');
    const categorias = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    console.log('Categorías encontradas:', categorias);
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// API de productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await prisma.product.findMany({
      include: {
        category: true,
        agricultor: {
          select: {
            id: true,
            user: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        }
      }
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    console.log('Recibida petición POST en /api/productos');
    console.log('Datos recibidos:', req.body);
    
    const data = req.body;
    
    // Validaciones básicas
    if (!data.name || typeof data.name !== "string") {
      return res.status(400).json({ error: "Nombre requerido" });
    }
    if (!data.price || typeof data.price !== "number") {
      return res.status(400).json({ error: "Precio requerido" });
    }
    if (!data.categoryId || typeof data.categoryId !== "string") {
      return res.status(400).json({ error: "Categoría requerida" });
    }
    
    // Verificar que existe la categoría
    const categoria = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    
    if (!categoria) {
      return res.status(400).json({ error: "Categoría no encontrada" });
    }
    
    // Verificar que existe un agricultor o crear uno de prueba
    let agricultor = await prisma.agricultor.findFirst();
    
    if (!agricultor) {
      console.log('No se encontró agricultor, creando uno de prueba...');
      
      // Crear usuario primero
      const user = await prisma.user.create({
        data: {
          id: `user_${Date.now()}`,
          nombre: 'Agricultor de Prueba',
          correo: `test${Date.now()}@agricola.com`,
          contraseña: 'password123',
          roleId: 'role1' // Necesitamos que exista este rol
        }
      });
      
      // Crear agricultor
      agricultor = await prisma.agricultor.create({
        data: {
          id: `agricultor_${Date.now()}`,
          user_id: user.id,
          telefono: '3001234567',
          ubicacion: 'Finca de prueba',
          descripcion: 'Agricultor de prueba para el sistema'
        }
      });
      
      console.log('Agricultor de prueba creado:', agricultor);
    }
    
    // Crear producto en la base de datos
    const productoId = `product_${Date.now()}`;
    
    const producto = await prisma.product.create({
      data: {
        id: productoId,
        name: data.name,
        description: data.description || '',
        price: data.price,
        unit: data.unit || 'kg',
        stock: data.stock || 0,
        imageUrl: data.imageUrl || '',
        agricultorId: agricultor.id,
        categoryId: data.categoryId
      }
    });
    
    console.log('Producto creado en BD:', producto);
    
    res.status(201).json(producto);
    
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
});

// Función para generar IDs únicos
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateAgricultorId() {
  return `agricultor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateClienteId() {
  return `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateEmpresaId() {
  return `empresa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// API de registro de usuarios
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Datos de registro recibidos:', req.body);
    
    const { name, email, password, role, phone, address } = req.body;

    // Validar campos obligatorios
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Normalizar nombre de rol
    let normalizedRole = role;
    if (role === 'CAMPESINO') normalizedRole = 'agricultor';
    if (role === 'COMPRADOR') normalizedRole = 'cliente';
    if (role === 'EMPRESA') normalizedRole = 'empresa';

    console.log('Rol normalizado:', normalizedRole);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ 
      where: { correo: email } 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Obtener el roleId
    const roleRecord = await prisma.role.findUnique({
      where: { name: normalizedRole }
    });
    
    if (!roleRecord) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    console.log('Role record encontrado:', roleRecord);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const userId = generateUserId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        nombre: name,
        correo: email,
        contraseña: hashedPassword,
        roleId: roleRecord.id,
        isActive: true, // Activamos inmediatamente para pruebas
      },
    });

    console.log('Usuario creado:', user);

    // Crear perfil específico según el rol
    try {
      if (normalizedRole === 'agricultor') {
        await prisma.agricultor.create({
          data: {
            id: generateAgricultorId(),
            user_id: user.id,
            telefono: phone || null,
            ubicacion: address || null,
            verificado: false,
          },
        });
      } else if (normalizedRole === 'cliente') {
        await prisma.cliente.create({
          data: {
            id: generateClienteId(),
            user_id: user.id,
            telefono: phone || null,
            direccion: address || null,
          },
        });
      } else if (normalizedRole === 'empresa') {
        await prisma.empresa.create({
          data: {
            id: generateEmpresaId(),
            user_id: user.id,
            razon_social: name,
            nit: '',
            telefono: phone || null,
            direccion: address || null,
            verificada: false,
          },
        });
      }
      
      console.log('Perfil específico creado para rol:', normalizedRole);
      
    } catch (profileError) {
      console.error('Error creating profile:', profileError);
      // Si falla la creación del perfil, eliminar el usuario creado
      await prisma.user.delete({ where: { id: user.id } });
      throw new Error('Error al crear el perfil del usuario');
    }

    res.status(201).json({
      message: 'Registro exitoso. Cuenta activada automáticamente para pruebas.',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: roleRecord.displayName || roleRecord.name,
      },
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    let message = 'Error en el registro';
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    res.status(500).json({ error: message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log('  - http://localhost:' + PORT + '/ - Formulario productos');
  console.log('  - http://localhost:' + PORT + '/agricultor/publicar - Formulario productos');
  console.log('  - http://localhost:' + PORT + '/auth/registro - Formulario registro');
  console.log('  - GET http://localhost:' + PORT + '/api/categorias - API categorías');
  console.log('  - GET/POST http://localhost:' + PORT + '/api/productos - API productos');
  console.log('  - POST http://localhost:' + PORT + '/api/auth/register - API registro');
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
