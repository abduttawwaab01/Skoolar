-- Update subscription plans: Change Starter/Professional/Enterprise to Free/Pro/Custom
-- Run this in your database CLI or Prisma Studio

-- First, update existing plans
-- If you have a "Starter" plan, update it to "Free"
UPDATE "SubscriptionPlan" 
SET 
  name = 'free',
  "displayName" = 'Free',
  price = 0,
  "maxStudents" = 50,
  "maxTeachers" = 5,
  "maxClasses" = 10,
  features = '["Up to 50 students", "Up to 5 teachers", "Up to 10 classes", "Basic report cards", "Attendance tracking", "Community support"]'
WHERE name ILIKE '%starter%' OR "displayName" ILIKE '%starter%';

-- If you have a "Professional" or "Pro" plan, update it to "Pro"
UPDATE "SubscriptionPlan" 
SET 
  name = 'pro',
  "displayName" = 'Pro',
  -- Keep existing price or set to 0 for admin control
  "maxStudents" = 500,
  "maxTeachers" = 50,
  "maxClasses" = -1,
  features = '["Up to 500 students", "Up to 50 teachers", "Unlimited classes", "Advanced report cards", "Video lessons", "AI grading assistant", "Homework management", "Email support"]'
WHERE name ILIKE '%professional%' OR "displayName" ILIKE '%professional%' OR name = 'pro';

-- If you have an "Enterprise" plan, update it to "Custom"
UPDATE "SubscriptionPlan" 
SET 
  name = 'custom',
  "displayName" = 'Custom',
  price = 0,
  "maxStudents" = -1,
  "maxTeachers" = -1,
  "maxClasses" = -1,
  features = '["Unlimited students", "Unlimited teachers", "Unlimited classes", "Custom features", "Custom pricing", "Dedicated support"]'
WHERE name ILIKE '%enterprise%' OR "displayName" ILIKE '%enterprise%';

-- Deactivate any remaining old plans that don't match Free/Pro/Custom
UPDATE "SubscriptionPlan" 
SET "isActive" = false
WHERE name NOT IN ('free', 'pro', 'custom');

-- Insert Free plan if it doesn't exist
INSERT INTO "SubscriptionPlan" (id, name, "displayName", price, "yearlyPrice", "maxStudents", "maxTeachers", "maxClasses", "maxParents", "maxLibraryBooks", "maxVideoLessons", "maxHomeworkPerMonth", "storageLimit", "supportLevel", "customDomain", "apiAccess", "whiteLabel", features, "isActive", "paystackPlanCode", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'free', 'Free', 0, NULL, 50, 5, 10, 100, 500, 50, 100, 1000, 'community', false, false, false, '["Up to 50 students", "Up to 5 teachers", "Up to 10 classes", "Basic report cards", "Attendance tracking", "Community support"]', true, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "SubscriptionPlan" WHERE name = 'free');

-- Insert Pro plan if it doesn't exist
INSERT INTO "SubscriptionPlan" (id, name, "displayName", price, "yearlyPrice", "maxStudents", "maxTeachers", "maxClasses", "maxParents", "maxLibraryBooks", "maxVideoLessons", "maxHomeworkPerMonth", "storageLimit", "supportLevel", "customDomain", "apiAccess", "whiteLabel", features, "isActive", "paystackPlanCode", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'pro', 'Pro', 0, NULL, 500, 50, -1, -1, -1, -1, -1, -1, 'email', false, false, false, '["Up to 500 students", "Up to 50 teachers", "Unlimited classes", "Advanced report cards", "Video lessons", "AI grading assistant", "Homework management", "Email support"]', true, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "SubscriptionPlan" WHERE name = 'pro');

-- Insert Custom plan if it doesn't exist
INSERT INTO "SubscriptionPlan" (id, name, "displayName", price, "yearlyPrice", "maxStudents", "maxTeachers", "maxClasses", "maxParents", "maxLibraryBooks", "maxVideoLessons", "maxHomeworkPerMonth", "storageLimit", "supportLevel", "customDomain", "apiAccess", "whiteLabel", features, "isActive", "paystackPlanCode", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'custom', 'Custom', 0, NULL, -1, -1, -1, -1, -1, -1, -1, -1, 'dedicated', false, false, false, '["Unlimited students", "Unlimited teachers", "Unlimited classes", "Custom features", "Custom pricing", "Dedicated support"]', true, NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "SubscriptionPlan" WHERE name = 'custom');

-- Verify the changes
SELECT id, name, "displayName", price, "yearlyPrice", "isActive" FROM "SubscriptionPlan" ORDER BY price ASC;
