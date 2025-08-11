import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea administrador
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role.name !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { type } = await request.json();

    // Crear backup
    const backupData = await createBackup(type || 'complete');
    
    // Guardar backup en archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${type || 'complete'}_${timestamp}.json`;
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Crear directorio si no existe
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    const filePath = path.join(backupDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Backup creado exitosamente',
      fileName,
      filePath,
      size: (await fs.stat(filePath)).size,
      timestamp
    });

  } catch (error) {
    console.error('Error al crear backup:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function createBackup(type: string) {
  const backup = {
    metadata: {
      version: '1.0',
      type,
      createdAt: new Date().toISOString(),
      description: `Backup ${type} del sistema AgroConecta`,
      statistics: {} as any
    },
    data: {} as any
  };

  try {
    if (type === 'complete' || type === 'users') {
      // Backup de usuarios (sin contraseñas)
      backup.data.users = await prisma.user.findMany({
        select: {
          id: true,
          nombre: true,
          correo: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          roleId: true,
          role: true,
          agricultor: true,
          cliente: true,
          empresa: true
        }
      });
    }

    if (type === 'complete' || type === 'products') {
      // Backup de productos y categorías
      backup.data.categories = await prisma.category.findMany({
        include: {
          subcategories: true
        }
      });
      
      backup.data.products = await prisma.product.findMany({
        include: {
          category: true,
          subcategory: true,
          agricultor: {
            include: {
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
    }

    if (type === 'complete' || type === 'orders') {
      // Backup de pedidos
      backup.data.orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          },
          buyer: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });
    }

    if (type === 'complete' || type === 'financial') {
      // Backup de datos financieros
      backup.data.wallets = await prisma.wallet.findMany({
        include: {
          transactions: true,
          user: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      backup.data.withdrawRequests = await prisma.withdrawRequest.findMany({
        include: {
          user: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      backup.data.sales = await prisma.sale.findMany({
        include: {
          vendedor: {
            select: {
              nombre: true,
              correo: true
            }
          },
          comprador: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });
    }

    if (type === 'complete' || type === 'system') {
      // Backup de configuraciones del sistema
      backup.data.roles = await prisma.role.findMany();
      backup.data.notifications = await prisma.notification.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          }
        }
      });
    }

    // Estadísticas del backup
    backup.metadata.statistics = {
      totalUsers: backup.data.users?.length || 0,
      totalProducts: backup.data.products?.length || 0,
      totalOrders: backup.data.orders?.length || 0,
      totalCategories: backup.data.categories?.length || 0,
      totalWallets: backup.data.wallets?.length || 0,
      totalSales: backup.data.sales?.length || 0
    };

    return backup;

  } catch (error) {
    console.error('Error al crear backup:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea administrador
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role.name !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Listar backups existentes
    const backupDir = path.join(process.cwd(), 'backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      const backups = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          return {
            name: file,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };
        })
      );

      return NextResponse.json({
        success: true,
        backups: backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      });

    } catch (error) {
      return NextResponse.json({
        success: true,
        backups: []
      });
    }

  } catch (error) {
    console.error('Error al listar backups:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
