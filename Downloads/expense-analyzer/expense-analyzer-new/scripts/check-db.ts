import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to database');
    
    // Test schema access
    const schemaPrivs = await prisma.$queryRaw`
      SELECT 
        HAS_SCHEMA_PRIVILEGE(current_user, 'public', 'usage') as has_usage,
        HAS_SCHEMA_PRIVILEGE(current_user, 'public', 'create') as has_create
    `;
    console.log('✅ Schema privileges:', schemaPrivs);
    
    // Test user permissions
    const userPerms = await prisma.$queryRaw`
      SELECT 
        current_user as username,
        current_database() as database,
        usesuper as is_superuser
      FROM pg_user
      WHERE usename = current_user;
    `;
    console.log('👤 User permissions:', userPerms);
    
    // List actual tables first
    const tables = await prisma.$queryRaw`
      SELECT tablename, schemaname
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '_prisma_%'
      ORDER BY tablename;
    `;
    console.log('📋 Available tables:', tables);

    // Test table permissions only for existing tables
    const tablePerms = await prisma.$queryRaw`
      SELECT 
        tablename as table_name,
        has_table_privilege(current_user, tablename::regclass, 'SELECT') as can_select,
        has_table_privilege(current_user, tablename::regclass, 'INSERT') as can_insert,
        has_table_privilege(current_user, tablename::regclass, 'UPDATE') as can_update,
        has_table_privilege(current_user, tablename::regclass, 'DELETE') as can_delete
      FROM pg_tables 
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '_prisma_%'
      ORDER BY tablename;
    `;
    console.log('📊 Table permissions:', tablePerms);

    // Test record counts only if tables exist
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.receipt.count()
    ]).catch(e => {
      console.log('⚠️ Could not get record counts:', e.message);
      return [0, 0, 0];
    });

    console.log('📈 Record counts:', {
      users: counts[0],
      transactions: counts[1],
      receipts: counts[2]
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();