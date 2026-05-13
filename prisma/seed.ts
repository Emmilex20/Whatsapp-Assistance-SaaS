import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL?.replace(
  "sslmode=require",
  "sslmode=verify-full"
);

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@serveflow.app" },
    update: {
      clerkId: "demo_clerk_user",
      name: "Demo Owner",
    },
    create: {
      clerkId: "demo_clerk_user",
      email: "demo@serveflow.app",
      name: "Demo Owner",
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { id: "demo_restaurant" },
    update: {
      ownerId: user.id,
      name: "Mama T's Kitchen",
      whatsappNumber: "+2348012345678",
      whatsappPhoneNumberId: "demo_phone_number_id",
      address: "Kubwa, Abuja",
      openingTime: "9:00 AM",
      closingTime: "9:00 PM",
    },
    create: {
      id: "demo_restaurant",
      ownerId: user.id,
      name: "Mama T's Kitchen",
      whatsappNumber: "+2348012345678",
      whatsappPhoneNumberId: "demo_phone_number_id",
      address: "Kubwa, Abuja",
      openingTime: "9:00 AM",
      closingTime: "9:00 PM",
    },
  });

  await prisma.subscription.upsert({
    where: { restaurantId: restaurant.id },
    update: {
      plan: "growth",
      status: "ACTIVE",
    },
    create: {
      restaurantId: restaurant.id,
      plan: "growth",
      status: "ACTIVE",
    },
  });

  await Promise.all([
    prisma.menuItem.upsert({
      where: { id: "demo_menu_jollof" },
      update: {
        name: "Jollof Rice & Chicken",
        category: "Rice",
        price: 3500,
        available: true,
        isDemo: true,
      },
      create: {
        id: "demo_menu_jollof",
        restaurantId: restaurant.id,
        name: "Jollof Rice & Chicken",
        category: "Rice",
        price: 3500,
        isDemo: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "demo_menu_shawarma" },
      update: {
        name: "Beef Shawarma",
        category: "Shawarma",
        price: 2800,
        available: true,
        isDemo: true,
      },
      create: {
        id: "demo_menu_shawarma",
        restaurantId: restaurant.id,
        name: "Beef Shawarma",
        category: "Shawarma",
        price: 2800,
        isDemo: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "demo_menu_egusi" },
      update: {
        name: "Egusi Soup with Pounded Yam",
        category: "Swallow",
        price: 4500,
        available: true,
        isDemo: true,
      },
      create: {
        id: "demo_menu_egusi",
        restaurantId: restaurant.id,
        name: "Egusi Soup with Pounded Yam",
        category: "Swallow",
        price: 4500,
        isDemo: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.deliveryZone.upsert({
      where: { id: "demo_zone_kubwa" },
      update: {
        area: "Kubwa",
        fee: 1000,
        estimatedTime: "30 - 45 minutes",
        active: true,
        isDemo: true,
      },
      create: {
        id: "demo_zone_kubwa",
        restaurantId: restaurant.id,
        area: "Kubwa",
        fee: 1000,
        estimatedTime: "30 - 45 minutes",
        isDemo: true,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: "demo_zone_wuse" },
      update: {
        area: "Wuse",
        fee: 1500,
        estimatedTime: "45 - 60 minutes",
        active: true,
        isDemo: true,
      },
      create: {
        id: "demo_zone_wuse",
        restaurantId: restaurant.id,
        area: "Wuse",
        fee: 1500,
        estimatedTime: "45 - 60 minutes",
        isDemo: true,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: "demo_zone_gwarinpa" },
      update: {
        area: "Gwarinpa",
        fee: 1200,
        estimatedTime: "35 - 50 minutes",
        active: true,
        isDemo: true,
      },
      create: {
        id: "demo_zone_gwarinpa",
        restaurantId: restaurant.id,
        area: "Gwarinpa",
        fee: 1200,
        estimatedTime: "35 - 50 minutes",
        isDemo: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.automation.upsert({
      where: { id: "demo_automation_hours" },
      update: {
        name: "Opening hours",
        triggers: ["open", "time", "closing"],
        response: "We are open from 9:00 AM to 9:00 PM every day.",
        usedCount: 8,
        status: "ACTIVE",
        isDemo: true,
      },
      create: {
        id: "demo_automation_hours",
        restaurantId: restaurant.id,
        name: "Opening hours",
        triggers: ["open", "time", "closing"],
        response: "We are open from 9:00 AM to 9:00 PM every day.",
        usedCount: 8,
        isDemo: true,
      },
    }),
    prisma.automation.upsert({
      where: { id: "demo_automation_payment" },
      update: {
        name: "Payment options",
        triggers: ["pay", "payment", "transfer"],
        response: "You can pay by transfer, card, or cash on delivery.",
        usedCount: 5,
        status: "ACTIVE",
        isDemo: true,
      },
      create: {
        id: "demo_automation_payment",
        restaurantId: restaurant.id,
        name: "Payment options",
        triggers: ["pay", "payment", "transfer"],
        response: "You can pay by transfer, card, or cash on delivery.",
        usedCount: 5,
        isDemo: true,
      },
    }),
  ]);

  const conversation = await prisma.conversation.upsert({
    where: {
      restaurantId_customerPhone: {
        restaurantId: restaurant.id,
        customerPhone: "2348012345678",
      },
    },
    update: {
      customerName: "Amaka Okafor",
      status: "BOT_ACTIVE",
      isDemo: true,
    },
    create: {
      restaurantId: restaurant.id,
      customerName: "Amaka Okafor",
      customerPhone: "2348012345678",
      status: "BOT_ACTIVE",
      isDemo: true,
    },
  });

  await prisma.message.deleteMany({
    where: { conversationId: conversation.id },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: "Please send menu",
        isDemo: true,
      },
      {
        conversationId: conversation.id,
        senderType: "BOT",
        content:
          "Hello! Welcome to Mama T's Kitchen.\n\nHere is today's menu:\n\n*Rice*\n- Jollof Rice & Chicken - NGN 3,500",
        isDemo: true,
      },
      {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: "I want Jollof Rice and Chicken",
        isDemo: true,
      },
      {
        conversationId: conversation.id,
        senderType: "BOT",
        content: "Great choice! Please send your delivery address to continue.",
        isDemo: true,
      },
    ],
  });

  await prisma.order.upsert({
    where: { id: "demo_order_jollof" },
    update: {
      conversationId: conversation.id,
      customerName: "Amaka Okafor",
      customerPhone: "2348012345678",
      deliveryAddress: "Kubwa, Abuja",
      deliveryFee: 1000,
      totalAmount: 4500,
      status: "NEW",
      notes: "Demo WhatsApp order.",
      isDemo: true,
    },
    create: {
      id: "demo_order_jollof",
      restaurantId: restaurant.id,
      conversationId: conversation.id,
      customerName: "Amaka Okafor",
      customerPhone: "2348012345678",
      deliveryAddress: "Kubwa, Abuja",
      deliveryFee: 1000,
      totalAmount: 4500,
      status: "NEW",
      notes: "Demo WhatsApp order.",
      isDemo: true,
      items: {
        create: {
          name: "Jollof Rice & Chicken",
          quantity: 1,
          price: 3500,
          isDemo: true,
        },
      },
    },
  });

  const order = await prisma.order.findUnique({
    where: { id: "demo_order_jollof" },
    include: { items: true },
  });

  if (order) {
    await prisma.orderItem.updateMany({
      where: { orderId: order.id },
      data: { isDemo: true },
    });
  }

  if (order && order.items.length === 0) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        name: "Jollof Rice & Chicken",
        quantity: 1,
        price: 3500,
        isDemo: true,
      },
    });
  }

  console.log("Demo seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
