import {
  BookingStatus,
  CompanyType,
  DealStage,
  InvoiceStatus,
  PrismaClient,
  Role,
  TalentStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const org = await prisma.organization.upsert({
    where: { slug: "marquee" },
    update: {},
    create: {
      name: "Marquee Booking",
      slug: "marquee",
      timezone: "Asia/Tashkent",
      currency: "USD",
    },
  });

  const owner = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "ivan.p@example.net" } },
    update: { passwordHash },
    create: {
      organizationId: org.id,
      email: "ivan.p@example.net",
      passwordHash,
      firstName: "Amir",
      lastName: "Karimov",
      role: Role.OWNER,
    },
  });

  const agent = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "tom.h@example.org" } },
    update: { passwordHash },
    create: {
      organizationId: org.id,
      email: "tom.h@example.org",
      passwordHash,
      firstName: "Laylo",
      lastName: "Rakhimova",
      role: Role.AGENT,
    },
  });

  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "emma.t@example.net" } },
    update: { passwordHash },
    create: {
      organizationId: org.id,
      email: "emma.t@example.net",
      passwordHash,
      firstName: "Jasur",
      lastName: "Tursunov",
      role: Role.FINANCE,
    },
  });

  const already = await prisma.company.count({ where: { organizationId: org.id } });
  if (already > 0) {
    console.log("Seed skipped — organization already has CRM data.");
    console.log("  Owner  ivan.p@example.net / password123");
    return;
  }

  const companies = await Promise.all(
    [
      {
        name: "Humo Arena",
        type: CompanyType.VENUE,
        city: "Tashkent",
        country: "Uzbekistan",
        email: "xavier.y@example.org",
      },
      {
        name: "Frame Festival",
        type: CompanyType.FESTIVAL,
        city: "Tashkent",
        country: "Uzbekistan",
        email: "hannah.h@example.com",
      },
      {
        name: "Almaty Arena",
        type: CompanyType.VENUE,
        city: "Almaty",
        country: "Kazakhstan",
        email: "ivan.p@example.net",
      },
      {
        name: "Nightshift Promotions",
        type: CompanyType.PROMOTER,
        city: "Dubai",
        country: "UAE",
        email: "tom.h@example.org",
      },
      {
        name: "Royal Albert Hall",
        type: CompanyType.VENUE,
        city: "London",
        country: "United Kingdom",
        email: "xavier.y@example.org",
      },
    ].map((c) =>
      prisma.company.create({
        data: { ...c, organizationId: org.id },
      }),
    ),
  );

  const [humo, frame, almaty, nightshift, rah] = companies;

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        organizationId: org.id,
        companyId: humo.id,
        firstName: "Dilshod",
        lastName: "Ismoilov",
        title: "Programming director",
        email: "grace.l@example.com",
        phone: "+998 90 111 22 33",
      },
    }),
    prisma.contact.create({
      data: {
        organizationId: org.id,
        companyId: frame.id,
        firstName: "Madina",
        lastName: "Yusupova",
        title: "Talent buyer",
        email: "olivia.t@example.org",
      },
    }),
    prisma.contact.create({
      data: {
        organizationId: org.id,
        companyId: nightshift.id,
        firstName: "Omar",
        lastName: "Haddad",
        title: "Promoter",
        email: "olivia.t@example.org",
      },
    }),
  ]);

  const talent = await Promise.all([
    prisma.talent.create({
      data: {
        organizationId: org.id,
        name: "Nilufar Usmonova",
        genre: "Pop",
        homeCity: "Tashkent",
        feeMin: 18000,
        feeMax: 35000,
        status: TalentStatus.ACTIVE,
        bio: "Headlining pop vocalist. Strong festival and arena draw across Central Asia.",
      },
    }),
    prisma.talent.create({
      data: {
        organizationId: org.id,
        name: "The Silk Route",
        genre: "Indie / world",
        homeCity: "Samarkand",
        feeMin: 8000,
        feeMax: 16000,
        status: TalentStatus.ACTIVE,
        bio: "Five-piece blending folk motifs with indie rock. Ideal for theatres and boutique festivals.",
      },
    }),
    prisma.talent.create({
      data: {
        organizationId: org.id,
        name: "DJ Kamola",
        genre: "Electronic",
        homeCity: "Tashkent",
        feeMin: 5000,
        feeMax: 12000,
        status: TalentStatus.ACTIVE,
      },
    }),
    prisma.talent.create({
      data: {
        organizationId: org.id,
        name: "Oydin",
        genre: "Jazz",
        homeCity: "Bukhara",
        feeMin: 4000,
        feeMax: 9000,
        status: TalentStatus.ON_HOLD,
        notes: "Album cycle — limited availability until November.",
      },
    }),
  ]);

  const [nilufar, silk, kamola] = talent;

  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        organizationId: org.id,
        title: "Nilufar × Humo Arena autumn date",
        stage: DealStage.NEGOTIATION,
        value: 28000,
        expectedClose: daysFromNow(12),
        ownerId: owner.id,
        talentId: nilufar.id,
        companyId: humo.id,
        contactId: contacts[0].id,
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: org.id,
        title: "Silk Route — Frame Festival",
        stage: DealStage.PROPOSAL,
        value: 12000,
        expectedClose: daysFromNow(20),
        ownerId: agent.id,
        talentId: silk.id,
        companyId: frame.id,
        contactId: contacts[1].id,
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: org.id,
        title: "Kamola Dubai club run",
        stage: DealStage.QUALIFIED,
        value: 15000,
        expectedClose: daysFromNow(30),
        ownerId: agent.id,
        talentId: kamola.id,
        companyId: nightshift.id,
        contactId: contacts[2].id,
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: org.id,
        title: "Oydin London jazz night",
        stage: DealStage.LEAD,
        value: 7000,
        ownerId: owner.id,
        companyId: rah.id,
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: org.id,
        title: "Almaty New Year hold",
        stage: DealStage.WON,
        value: 32000,
        ownerId: owner.id,
        talentId: nilufar.id,
        companyId: almaty.id,
      },
    }),
  ]);

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        organizationId: org.id,
        title: "Nilufar — Almaty Arena",
        status: BookingStatus.CONTRACTED,
        eventDate: daysFromNow(45),
        venueName: "Almaty Arena",
        city: "Almaty",
        fee: 32000,
        deposit: 10000,
        talentId: nilufar.id,
        companyId: almaty.id,
        ownerId: owner.id,
        dealId: deals[4].id,
      },
    }),
    prisma.booking.create({
      data: {
        organizationId: org.id,
        title: "The Silk Route — Frame Festival",
        status: BookingStatus.HOLD,
        eventDate: daysFromNow(70),
        venueName: "Frame Main Stage",
        city: "Tashkent",
        fee: 12000,
        deposit: 3000,
        talentId: silk.id,
        companyId: frame.id,
        contactId: contacts[1].id,
        ownerId: agent.id,
      },
    }),
    prisma.booking.create({
      data: {
        organizationId: org.id,
        title: "DJ Kamola — Nightshift Dubai",
        status: BookingStatus.CONFIRMED,
        eventDate: daysFromNow(18),
        venueName: "Soho Garden",
        city: "Dubai",
        fee: 9000,
        deposit: 3000,
        talentId: kamola.id,
        companyId: nightshift.id,
        contactId: contacts[2].id,
        ownerId: agent.id,
      },
    }),
    prisma.booking.create({
      data: {
        organizationId: org.id,
        title: "Nilufar — Humo Arena",
        status: BookingStatus.INQUIRY,
        eventDate: daysFromNow(90),
        venueName: "Humo Arena",
        city: "Tashkent",
        fee: 28000,
        talentId: nilufar.id,
        companyId: humo.id,
        contactId: contacts[0].id,
        ownerId: owner.id,
      },
    }),
  ]);

  await prisma.invoice.createMany({
    data: [
      {
        organizationId: org.id,
        bookingId: bookings[0].id,
        number: "INV-0001",
        status: InvoiceStatus.SENT,
        amount: 10000,
        amountPaid: 0,
        issuedAt: new Date(),
        dueAt: daysFromNow(14),
        notes: "Deposit invoice",
      },
      {
        organizationId: org.id,
        bookingId: bookings[2].id,
        number: "INV-0002",
        status: InvoiceStatus.PARTIAL,
        amount: 9000,
        amountPaid: 3000,
        issuedAt: new Date(),
        dueAt: daysFromNow(7),
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        organizationId: org.id,
        type: "CALL",
        body: "Spoke with Dilshod — Humo wants a Friday in November, waiting on production costs.",
        actorId: owner.id,
        contactId: contacts[0].id,
        bookingId: bookings[3].id,
      },
      {
        organizationId: org.id,
        type: "NOTE",
        body: "Hold confirmed through Frame until 20 Sep. Need rider by next week.",
        actorId: agent.id,
        bookingId: bookings[1].id,
      },
    ],
  });

  console.log("Seeded Marquee Booking");
  console.log("  Owner  ivan.p@example.net / password123");
  console.log("  Agent  tom.h@example.org / password123");
  console.log("  Finance emma.t@example.net / password123");
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(20, 0, 0, 0);
  return d;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
