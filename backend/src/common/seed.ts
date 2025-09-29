import { prisma } from './prisma.js';
import argon2 from 'argon2';

async function main() {
  // Basic roles & permissions
  const perms = [
    { code: 'user.read', description: 'Read users' },
    { code: 'user.write', description: 'Manage users' },
    { code: 'org.manage', description: 'Manage organizations' }
  ];
  for (const p of perms) {
    await prisma.permission.upsert({ where: { code: p.code }, update: {}, create: p });
  }

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'System Administrator' }
  });

  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id }
    });
  }

  const email = 'admin@onruf.local';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await argon2.hash('ChangeMe123!');
    const user = await prisma.user.create({ data: { email, passwordHash, name: 'Super Admin' } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: adminRole.id } });
    console.log('Seeded admin user:', email, 'password=ChangeMe123!');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
