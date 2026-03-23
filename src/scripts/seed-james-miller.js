/**
 * Seed script: creates james.miller@prime.com and assigns 4 tasks to them.
 * Run AFTER the backend + MongoDB are both started:
 *
 *   node src/scripts/seed-james-miller.js
 *
 * Requires: MONGO_URI in .env (or falls back to mongodb://localhost:27017/prime-backend)
 */

const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

// Load .env manually
const fs = require('fs'), path = require('path')
const envPath = path.join(__dirname, '../../.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#') && v.length) process.env[k.trim()] = v.join('=').trim()
  })
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/prime-backend'

const TASKS_TO_ASSIGN = [
  {
    title: 'Complete your new learning activity Q1: learning acc',
    description: 'Review and complete the Q1 learning accumulation activity.',
    priority: 'HIGH',
    dueDate: new Date('2025-02-13T00:00:00Z'),
    status: 'IN_PROGRESS',
  },
  {
    title: 'Please sign your recently prepared Plan Of Activity/action by Rob Bastow',
    description: 'Review and digitally sign your action plan.',
    priority: 'HIGH',
    dueDate: new Date('2025-02-13T00:00:00Z'),
    status: 'COMPLETED',
  },
  {
    title: 'You have not recorded any Off-The-Job activity recently. Please record your completed activity.',
    description: 'Log all off-the-job training hours in the system.',
    priority: 'MEDIUM',
    dueDate: new Date('2025-02-13T00:00:00Z'),
    status: 'PENDING',
  },
  {
    title: 'Upload evidence for UI UX module assessment',
    description: 'Submit your portfolio evidence for the UI/UX module.',
    priority: 'MEDIUM',
    dueDate: new Date('2025-03-01T00:00:00Z'),
    status: 'PENDING',
  },
]

async function seed() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  console.log('✅ Connected to MongoDB:', MONGO_URI)
  const db = client.db()

  // ── 1. Find or create a trainer/admin to be the task creator ──────────────
  let creator = await db.collection('users').findOne({ role: { $in: ['TRAINER', 'ORG_ADMIN', 'SUPER_ADMIN'] } })
  if (!creator) {
    console.log('⚠️  No admin/trainer found — creating a default trainer...')
    const passwordHash = await bcrypt.hash('Trainer@123', 12)
    const res = await db.collection('users').insertOne({
      firstName: 'Rob',
      lastName: 'Bastow',
      email: 'rob.bastow@prime.com',
      passwordHash,
      role: 'TRAINER',
      status: 'ACTIVE',
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    creator = { _id: res.insertedId }
    console.log('   Created trainer: rob.bastow@prime.com (password: Trainer@123)')
  } else {
    console.log(`✅ Using existing admin/trainer: ${creator.email}`)
  }

  // ── 2. Find or create james.miller@prime.com ──────────────────────────────
  let james = await db.collection('users').findOne({ email: 'james.miller@prime.com' })
  if (!james) {
    console.log('   james.miller@prime.com not found — creating...')
    const passwordHash = await bcrypt.hash('Learner@123', 12)
    const res = await db.collection('users').insertOne({
      firstName: 'James',
      lastName: 'Miller',
      email: 'james.miller@prime.com',
      passwordHash,
      role: 'LEARNER',
      status: 'ACTIVE',
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    james = { _id: res.insertedId, firstName: 'James', lastName: 'Miller', email: 'james.miller@prime.com' }
    console.log('✅ Created learner: james.miller@prime.com (password: Learner@123)')
  } else {
    console.log(`✅ Found existing learner: ${james.email} (ID: ${james._id})`)
  }

  // ── 3. Remove old seeded tasks for james (clean slate) ────────────────────
  const deleted = await db.collection('tasks').deleteMany({
    assignedTo: new ObjectId(james._id),
    isDeleted: false,
  })
  if (deleted.deletedCount > 0) {
    console.log(`   Cleared ${deleted.deletedCount} existing task(s) for james.miller`)
  }

  // ── 4. Insert tasks assigned to james ─────────────────────────────────────
  const now = new Date()
  const taskDocs = TASKS_TO_ASSIGN.map(t => ({
    ...t,
    assignedTo: new ObjectId(james._id),
    createdBy: new ObjectId(creator._id),
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  }))

  const result = await db.collection('tasks').insertMany(taskDocs)
  console.log(`\n✅ Inserted ${result.insertedCount} tasks for james.miller@prime.com`)
  TASKS_TO_ASSIGN.forEach((t, i) => {
    console.log(`   ${i + 1}. [${t.status}] ${t.title.slice(0, 60)}...`)
  })

  console.log('\n📋 Summary')
  console.log('   Learner email : james.miller@prime.com')
  console.log('   Learner pass  : Learner@123')
  console.log(`   Learner ID    : ${james._id}`)
  console.log('   Tasks assigned: 4')
  console.log('\nDone! The tasks will appear on the /tasks page when james.miller logs in.')

  await client.close()
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
