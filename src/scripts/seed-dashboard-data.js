/**
 * seed-dashboard-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Populates dummy learners, tasks and OTJ activities so every widget on the
 * Trainer's Dashboard accordion shows real numbers.
 *
 * HOW TO RUN  (from prime-learning-backend directory):
 *   node src/scripts/seed-dashboard-data.js
 *
 * What it does:
 *   1. Finds the first TRAINER user in the DB (or prints an error if none).
 *   2. Creates 12 dummy LEARNER accounts linked to that trainer.
 *   3. Creates tasks  → covers: Completed Visits, Planned Visits,
 *                                Progress Review Due, Task Due, IQA Action,
 *                                Learners Due 90 Days.
 *   4. Creates OTJ activities → covers: Learners on Target OTJ, No OTJ Activity.
 *   5. Stamps lastActivityAt  → covers: Learners Last Logged In.
 *   6. Task completion mix    → covers: Learners on Target.
 *
 * Safe to re-run: skips learners whose email already exists.
 */

const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')
const fs     = require('fs')
const path   = require('path')

// ── Load .env ─────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '../../.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#') && v.length) process.env[k.trim()] = v.join('=').trim()
  })
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/prime-backend'

// ── Helpers ───────────────────────────────────────────────────────────────────
const daysAgo   = n => new Date(Date.now() - n * 86400000)
const daysAhead = n => new Date(Date.now() + n * 86400000)
const rand      = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

// ── 12 dummy learners ─────────────────────────────────────────────────────────
const LEARNER_PROFILES = [
  { firstName: 'James',   lastName: 'Carter',   email: 'james.carter@dummy.prime'   },
  { firstName: 'Sophie',  lastName: 'Williams', email: 'sophie.williams@dummy.prime' },
  { firstName: 'Liam',    lastName: 'Johnson',  email: 'liam.johnson@dummy.prime'    },
  { firstName: 'Emma',    lastName: 'Brown',    email: 'emma.brown@dummy.prime'      },
  { firstName: 'Noah',    lastName: 'Davis',    email: 'noah.davis@dummy.prime'      },
  { firstName: 'Olivia',  lastName: 'Miller',   email: 'olivia.miller@dummy.prime'   },
  { firstName: 'Ethan',   lastName: 'Wilson',   email: 'ethan.wilson@dummy.prime'    },
  { firstName: 'Ava',     lastName: 'Moore',    email: 'ava.moore@dummy.prime'       },
  { firstName: 'Lucas',   lastName: 'Taylor',   email: 'lucas.taylor@dummy.prime'    },
  { firstName: 'Mia',     lastName: 'Anderson', email: 'mia.anderson@dummy.prime'    },
  { firstName: 'Mason',   lastName: 'Thomas',   email: 'mason.thomas@dummy.prime'    },
  { firstName: 'Isabella',lastName: 'Jackson',  email: 'isabella.jackson@dummy.prime'},
]

// lastActivityAt per learner index → covers "Last Logged In" buckets
const LAST_ACTIVITY = [
  daysAgo(2),   // within 7 days
  daysAgo(4),   // within 7 days
  daysAgo(6),   // within 7 days
  daysAgo(7),   // within 7 days
  daysAgo(10),  // 8-30 days
  daysAgo(15),  // 8-30 days
  daysAgo(22),  // 8-30 days
  daysAgo(28),  // 8-30 days
  daysAgo(35),  // over 30 days
  daysAgo(50),  // over 30 days
  daysAgo(65),  // over 30 days
  daysAgo(90),  // over 30 days
]
// Expected distribution: within7=4, 8-30=4, over30=4

// programEndDate per learner → some within 90 days for "Due to Complete"
const PROGRAM_END = [
  daysAhead(-7),  // -7 days (overdue)
  daysAhead(13),  // 13 days
  daysAhead(45),  // 45 days
  daysAhead(60),  // 60 days
  daysAhead(85),  // 85 days
  daysAhead(120), // outside 90 days → won't appear
  daysAhead(200),
  daysAhead(200),
  daysAhead(200),
  daysAhead(200),
  daysAhead(200),
  daysAhead(200),
]

// OTJ hours per learner → drives "Learners on Target OTJ"
// target = 100h  →  ahead: >=80h, on-target: 40-79h, behind: <40h
const OTJ_HOURS = [95, 88, 82, 72, 65, 55, 45, 42, 30, 18, 8, 0]
// Expected: ahead=3(95,88,82), on-target=4(72,65,55,45,42 → 5?), behind=...
// Let's use: ahead≥80: 95,88,82 → 3; 40-79: 72,65,55,45,42 → 5; below40: 30,18,8,0 → 4

// Days since last OTJ → drives "No OTJ Activity" buckets
// over 4 weeks(>28), 3-4 weeks(21-28), 2-3 weeks(14-21), 1-2 weeks(7-14), <7 days (Learning Break)
const LAST_OTJ_DAYS_AGO = [
  35,  // over 4 weeks
  40,  // over 4 weeks
  50,  // over 4 weeks
  24,  // 3-4 weeks
  22,  // 3-4 weeks
  16,  // 2-3 weeks
  15,  // 2-3 weeks
  10,  // 1-2 weeks
  9,   // 1-2 weeks
  5,   // <7 days (Learning Break bucket)
  3,   // <7 days
  null, // never had OTJ → over 4 weeks
]

// Task completion ratio per learner → drives "Learners on Target"
// ahead≥80%, on-target 40-79%, behind<40%
const TASK_COMPLETION_RATIO = [
  0.90, // ahead
  0.85, // ahead
  0.80, // ahead
  0.72, // on-target
  0.65, // on-target
  0.55, // on-target
  0.45, // on-target
  0.40, // on-target (border)
  0.30, // behind
  0.20, // behind
  0.10, // behind
  0.05, // behind
]
// Expected: ahead=3, on-target=5, behind=4

async function run() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  console.log('✅ Connected to MongoDB:', MONGO_URI)
  const db = client.db()

  // ── 1. Find trainer ──────────────────────────────────────────────────────────
  const trainer = await db.collection('users').findOne({ role: 'TRAINER' })
  if (!trainer) {
    console.error('❌  No TRAINER user found. Please create a trainer account first via the admin panel, then re-run this script.')
    await client.close()
    process.exit(1)
  }
  console.log(`👤 Using trainer: ${trainer.firstName} ${trainer.lastName} (${trainer.email}) — _id: ${trainer._id}`)
  const trainerId = trainer._id

  // ── 2. Password hash (same for all dummies) ──────────────────────────────────
  const passwordHash = await bcrypt.hash('Test@123', 10)

  // ── 3. Upsert learners ───────────────────────────────────────────────────────
  const learnerIds = []
  for (let i = 0; i < LEARNER_PROFILES.length; i++) {
    const p = LEARNER_PROFILES[i]
    const existing = await db.collection('users').findOne({ email: p.email })
    if (existing) {
      console.log(`  ⏩ Learner already exists: ${p.email}`)
      learnerIds.push(existing._id)
      // Update lastActivityAt & programEndDate to keep data fresh
      await db.collection('users').updateOne(
        { _id: existing._id },
        { $set: {
            trainerId,
            lastActivityAt: LAST_ACTIVITY[i],
            programEndDate: PROGRAM_END[i],
          }
        }
      )
      continue
    }

    const result = await db.collection('users').insertOne({
      firstName:       p.firstName,
      lastName:        p.lastName,
      email:           p.email,
      passwordHash,
      role:            'LEARNER',
      status:          'ACTIVE',
      trainerId,
      cohort:          'Cohort 2025',
      programme:       'Business Administration Level 3',
      employer:        'Acme Corp',
      lastActivityAt:  LAST_ACTIVITY[i],
      programEndDate:  PROGRAM_END[i],
      isDeleted:       false,
      createdAt:       new Date(),
      updatedAt:       new Date(),
    })
    learnerIds.push(result.insertedId)
    console.log(`  ✅ Created learner: ${p.firstName} ${p.lastName}`)
  }

  // ── 4. Tasks ─────────────────────────────────────────────────────────────────
  console.log('\n📋 Creating tasks...')

  // Clear previously seeded tasks for these learners to avoid duplicates
  await db.collection('tasks').deleteMany({
    assignedTo: { $in: learnerIds },
    title: { $regex: /\[SEED\]/ }
  })

  const allTaskIds = []

  for (let i = 0; i < learnerIds.length; i++) {
    const lid   = learnerIds[i]
    const ratio = TASK_COMPLETION_RATIO[i]
    const totalTasks = 10

    for (let t = 0; t < totalTasks; t++) {
      const isCompleted = t / totalTasks < ratio
      const status = isCompleted ? 'COMPLETED' : (t % 3 === 0 ? 'IN_PROGRESS' : 'PENDING')

      // Spread due dates for variety
      let dueDate
      if (isCompleted) {
        // Completed in last 30 days → feeds "Completed visits"
        dueDate = daysAgo(rand(1, 30))
      } else if (t === Math.floor(totalTasks * ratio)) {
        // First incomplete task → use daysAhead based on learner index
        if (i < 4)       dueDate = daysAhead(rand(1, 7))    // immediately / this week
        else if (i < 7)  dueDate = daysAhead(rand(8, 14))   // next week
        else if (i < 10) dueDate = daysAhead(rand(15, 28))  // in two weeks
        else             dueDate = daysAgo(rand(1, 14))      // overdue
      } else {
        dueDate = daysAhead(rand(1, 30))
      }

      const isIQA = (i === 0 && t === 0) // one IQA task for the first learner
      const taskDoc = {
        title:        isIQA ? '[SEED] IQA Internal Quality Assurance Review' : `[SEED] Task ${t + 1} for ${LEARNER_PROFILES[i].firstName}`,
        description:  `Dummy task created by seed script for dashboard testing.`,
        status,
        priority:     ['LOW','MEDIUM','HIGH'][t % 3],
        dueDate,
        assignedTo:   lid,
        createdBy:    lid,
        isDeleted:    false,
        primaryMethod: isIQA ? 'IQA Review' : 'Standard',
        completedAt:  isCompleted ? daysAgo(rand(1, 25)) : null,
        createdAt:    daysAgo(rand(30, 90)),
        updatedAt:    isCompleted ? daysAgo(rand(1, 25)) : new Date(),
      }
      const r = await db.collection('tasks').insertOne(taskDoc)
      allTaskIds.push(r.insertedId)
    }

    // Extra overdue review task for progress-reviews-due widget
    if (i < 4) {
      await db.collection('tasks').insertOne({
        title:       `[SEED] Overdue Progress Review for ${LEARNER_PROFILES[i].firstName}`,
        description: 'Progress review task that is overdue.',
        status:      'PENDING',
        priority:    'HIGH',
        dueDate:     daysAgo(rand(1, 20)),   // overdue
        assignedTo:  lid,
        createdBy:   lid,
        isDeleted:   false,
        primaryMethod: 'Progress Review',
        createdAt:   daysAgo(30),
        updatedAt:   new Date(),
      })
    }

    // Planned visits in next 30 days
    if (i < 6) {
      await db.collection('tasks').insertOne({
        title:       `[SEED] Planned Visit for ${LEARNER_PROFILES[i].firstName}`,
        description: 'Planned visit within the next 30 days.',
        status:      'PENDING',
        priority:    'MEDIUM',
        dueDate:     daysAhead(rand(1, 30)),
        assignedTo:  lid,
        createdBy:   lid,
        isDeleted:   false,
        primaryMethod: 'Face-to-face',
        createdAt:   daysAgo(5),
        updatedAt:   new Date(),
      })
    }
  }
  console.log(`  ✅ Created tasks for ${learnerIds.length} learners`)

  // ── 5. OTJ Learning Activities ───────────────────────────────────────────────
  console.log('\n🏃 Creating OTJ learning activities...')

  // Clear old seeded OTJ activities
  await db.collection('learningactivities').deleteMany({
    createdBy: { $in: learnerIds },
    title:     { $regex: /\[SEED\]/ }
  })

  for (let i = 0; i < learnerIds.length; i++) {
    const lid  = learnerIds[i]
    const hrs  = OTJ_HOURS[i]
    const lastOTJDaysAgo = LAST_OTJ_DAYS_AGO[i]

    if (hrs > 0 && lastOTJDaysAgo !== null) {
      // Create one OTJ activity with the right hours and date
      await db.collection('learningactivities').insertOne({
        title:           `[SEED] Off-The-Job Training — ${LEARNER_PROFILES[i].firstName}`,
        description:     'Dummy OTJ activity for dashboard seed data.',
        type:            'OFF_THE_JOB',
        offTheJobHours:  hrs,
        createdBy:       lid,
        learnerId:       lid,
        isDeleted:       false,
        createdAt:       daysAgo(lastOTJDaysAgo + 1),
        updatedAt:       daysAgo(lastOTJDaysAgo),
      })
    }
    // Also add a couple of ON_THE_JOB activities for variety
    if (i < 8) {
      await db.collection('learningactivities').insertOne({
        title:       `[SEED] On-The-Job Training — ${LEARNER_PROFILES[i].firstName}`,
        description: 'Dummy OTJ activity.',
        type:        'ON_THE_JOB',
        createdBy:   lid,
        learnerId:   lid,
        isDeleted:   false,
        createdAt:   daysAgo(rand(5, 20)),
        updatedAt:   daysAgo(rand(1, 10)),
      })
    }
  }
  console.log(`  ✅ Created OTJ activities`)

  // ── 6. Summary ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────')
  console.log('✅ SEED COMPLETE!  Expected dashboard values:')
  console.log('')
  console.log('  📅 Learners Last Logged In:')
  console.log('      Within last 7 days : 4')
  console.log('      8 – 30 days        : 4')
  console.log('      Over 30 days       : 4')
  console.log('')
  console.log('  🎯 Learners on Target (task completion):')
  console.log('      Ahead of target (≥80%) : 3')
  console.log('      On target (40-79%)     : 5')
  console.log('      Behind target (<40%)   : 4')
  console.log('')
  console.log('  🏃 Learners on Target OTJ (vs 100h target):')
  console.log('      Ahead (≥80h)     : 3  (95h, 88h, 82h)')
  console.log('      On target (40h+) : 5  (72h, 65h, 55h, 45h, 42h)')
  console.log('      Behind (<40h)    : 4  (30h, 18h, 8h, 0h)')
  console.log('')
  console.log('  🚫 No OTJ Activity:')
  console.log('      Over 4 weeks    : 3  (35, 40, 50 days ago)')
  console.log('      3 to 4 weeks    : 2  (24, 22 days ago)')
  console.log('      2 to 3 weeks    : 2  (16, 15 days ago)')
  console.log('      1 to 2 weeks    : 2  (10, 9 days ago)')
  console.log('      Learning Break  : 2  (5, 3 days ago)')
  console.log('      Never (no OTJ)  : 1  → counts as Over 4 weeks')
  console.log('')
  console.log('  📆 Learners Due in 90 Days:')
  console.log('      -7 days (overdue), 13, 45, 60, 85 days remaining')
  console.log('')
  console.log('  ✅ Completed Visits (last 30d) & Planned Visits (next 30d):')
  console.log('      Tasks spread across completion buckets')
  console.log('')
  console.log('  ⚠️  Progress Review Due & Task Due:')
  console.log('      Mix of overdue, this week, next week, in 2 weeks')
  console.log('')
  console.log('  🔍 IQA Action: 1 (title contains "IQA")')
  console.log('─────────────────────────────────────────────────────────\n')

  await client.close()
}

run().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
