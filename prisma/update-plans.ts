// Script to update subscription plans to Free, Pro, Custom
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating subscription plans to Free, Pro, Custom...');

  // Deactivate all existing plans first
  await prisma.subscriptionPlan.updateMany({
    data: { isActive: false },
  });
  console.log('Deactivated all existing plans');

  // Upsert Free plan
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'free' },
    update: {
      displayName: 'Free',
      price: 0,
      yearlyPrice: null,
      maxStudents: 50,
      maxTeachers: 5,
      maxClasses: 10,
      maxParents: 100,
      maxLibraryBooks: 500,
      maxVideoLessons: 50,
      maxHomeworkPerMonth: 100,
      storageLimit: 1000,
      supportLevel: 'community',
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      features: JSON.stringify(['Up to 50 students', 'Up to 5 teachers', 'Up to 10 classes', 'Basic report cards', 'Attendance tracking', 'Community support']),
      isActive: true,
      paystackPlanCode: null,
    },
    create: {
      name: 'free',
      displayName: 'Free',
      price: 0,
      yearlyPrice: null,
      maxStudents: 50,
      maxTeachers: 5,
      maxClasses: 10,
      maxParents: 100,
      maxLibraryBooks: 500,
      maxVideoLessons: 50,
      maxHomeworkPerMonth: 100,
      storageLimit: 1000,
      supportLevel: 'community',
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      features: JSON.stringify(['Up to 50 students', 'Up to 5 teachers', 'Up to 10 classes', 'Basic report cards', 'Attendance tracking', 'Community support']),
      isActive: true,
      paystackPlanCode: null,
    },
  });
  console.log('Free plan updated/created:', freePlan.id);

  // Upsert Pro plan (price set to 0 for admin control)
  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'pro' },
    update: {
      displayName: 'Pro',
      price: 0, // Admin can set price via UI
      yearlyPrice: null, // Admin can set via UI
      maxStudents: 500,
      maxTeachers: 50,
      maxClasses: -1,
      maxParents: -1,
      maxLibraryBooks: -1,
      maxVideoLessons: -1,
      maxHomeworkPerMonth: -1,
      storageLimit: -1,
      supportLevel: 'email',
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      features: JSON.stringify(['Up to 500 students', 'Up to 50 teachers', 'Unlimited classes', 'Advanced report cards', 'Video lessons', 'AI grading assistant', 'Homework management', 'Email support']),
      isActive: true,
      paystackPlanCode: null,
    },
    create: {
      name: 'pro',
      displayName: 'Pro',
      price: 0,
      yearlyPrice: null,
      maxStudents: 500,
      maxTeachers: 50,
      maxClasses: -1,
      maxParents: -1,
      maxLibraryBooks: -1,
      maxVideoLessons: -1,
      maxHomeworkPerMonth: -1,
      storageLimit: -1,
      supportLevel: 'email',
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      features: JSON.stringify(['Up to 500 students', 'Up to 50 teachers', 'Unlimited classes', 'Advanced report cards', 'Video lessons', 'AI grading assistant', 'Homework management', 'Email support']),
      isActive: true,
      paystackPlanCode: null,
    },
  });
  console.log('Pro plan updated/created:', proPlan.id);

  // Upsert Custom plan
  const customPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'custom' },
    update: {
      displayName: 'Custom',
      price: 0,
      yearlyPrice: null,
      maxStudents: -1,
      maxTeachers: -1,
      maxClasses: -1,
      maxParents: -1,
      maxLibraryBooks: -1,
      maxVideoLessons: -1,
      maxHomeworkPerMonth: -1,
      storageLimit: -1,
      supportLevel: 'dedicated',
      customDomain: true,
      apiAccess: true,
      whiteLabel: true,
      features: JSON.stringify(['Unlimited students', 'Unlimited teachers', 'Unlimited classes', 'Custom features', 'Custom pricing', 'Dedicated support', '_whatsapp:+2349152929772']),
      isActive: true,
      paystackPlanCode: null,
    },
    create: {
      name: 'custom',
      displayName: 'Custom',
      price: 0,
      yearlyPrice: null,
      maxStudents: -1,
      maxTeachers: -1,
      maxClasses: -1,
      maxParents: -1,
      maxLibraryBooks: -1,
      maxVideoLessons: -1,
      maxHomeworkPerMonth: -1,
      storageLimit: -1,
      supportLevel: 'dedicated',
      customDomain: true,
      apiAccess: true,
      whiteLabel: true,
      features: JSON.stringify(['Unlimited students', 'Unlimited teachers', 'Unlimited classes', 'Custom features', 'Custom pricing', 'Dedicated support', '_whatsapp:+2349152929772']),
      isActive: true,
      paystackPlanCode: null,
    },
  });
  console.log('Custom plan updated/created:', customPlan.id);

  // Show all active plans
  const allPlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });

  console.log('\nActive plans:');
  allPlans.forEach(p => {
    console.log(`- ${p.displayName} (${p.name}): ₦${p.price}/month`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
