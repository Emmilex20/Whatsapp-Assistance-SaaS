"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentRestaurant } from "@/lib/current-restaurant";

async function resetDemoDataForRestaurant(restaurantId: string) {
  const demoOrders = await prisma.order.findMany({
    where: {
      restaurantId,
      isDemo: true,
    },
    select: { id: true },
  });

  const demoOrderIds = demoOrders.map((order) => order.id);

  if (demoOrderIds.length) {
    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: demoOrderIds,
        },
        isDemo: true,
      },
    });
  }

  await prisma.order.deleteMany({
    where: {
      restaurantId,
      isDemo: true,
    },
  });

  const demoConversations = await prisma.conversation.findMany({
    where: {
      restaurantId,
      isDemo: true,
    },
    select: { id: true },
  });

  const demoConversationIds = demoConversations.map(
    (conversation) => conversation.id
  );

  if (demoConversationIds.length) {
    await prisma.message.deleteMany({
      where: {
        conversationId: {
          in: demoConversationIds,
        },
        isDemo: true,
      },
    });
  }

  await prisma.conversation.deleteMany({
    where: {
      restaurantId,
      isDemo: true,
    },
  });

  await prisma.menuItem.deleteMany({
    where: {
      restaurantId,
      isDemo: true,
    },
  });

  await prisma.deliveryZone.deleteMany({
    where: {
      restaurantId,
      isDemo: true,
    },
  });

  await prisma.automation.deleteMany({
    where: {
      restaurantId,
      isDemo: true,
    },
  });

  await prisma.fAQ.deleteMany({
    where: {
      restaurantId,
      isDemo: true,
    },
  });
}

function revalidateDemoPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard/settings/delivery");
  revalidatePath("/dashboard/launch");
}

export async function createDemoDataForCurrentUser() {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  const demoPrefix = `demo_${restaurant.id}`;

  await resetDemoDataForRestaurant(restaurant.id);

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: "Mama T's Kitchen",
      whatsappNumber: "+2348012345678",
      whatsappPhoneNumberId: "demo_phone_number_id",
      address: "Kubwa, Abuja",
      openingTime: "9:00 AM",
      closingTime: "9:00 PM",
    },
  });

  await Promise.all([
    prisma.menuItem.upsert({
      where: { id: `${demoPrefix}_menu_jollof` },
      update: {
        name: "Jollof Rice & Chicken",
        category: "Rice",
        price: 3500,
        available: true,
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_menu_jollof`,
        restaurantId: restaurant.id,
        name: "Jollof Rice & Chicken",
        category: "Rice",
        price: 3500,
        isDemo: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: `${demoPrefix}_menu_shawarma` },
      update: {
        name: "Beef Shawarma",
        category: "Shawarma",
        price: 2800,
        available: true,
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_menu_shawarma`,
        restaurantId: restaurant.id,
        name: "Beef Shawarma",
        category: "Shawarma",
        price: 2800,
        isDemo: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: `${demoPrefix}_menu_egusi` },
      update: {
        name: "Egusi Soup with Pounded Yam",
        category: "Swallow",
        price: 4500,
        available: true,
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_menu_egusi`,
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
      where: { id: `${demoPrefix}_zone_kubwa` },
      update: {
        area: "Kubwa",
        fee: 1000,
        estimatedTime: "30 - 45 minutes",
        active: true,
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_zone_kubwa`,
        restaurantId: restaurant.id,
        area: "Kubwa",
        fee: 1000,
        estimatedTime: "30 - 45 minutes",
        isDemo: true,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: `${demoPrefix}_zone_wuse` },
      update: {
        area: "Wuse",
        fee: 1500,
        estimatedTime: "45 - 60 minutes",
        active: true,
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_zone_wuse`,
        restaurantId: restaurant.id,
        area: "Wuse",
        fee: 1500,
        estimatedTime: "45 - 60 minutes",
        isDemo: true,
      },
    }),
    prisma.deliveryZone.upsert({
      where: { id: `${demoPrefix}_zone_gwarinpa` },
      update: {
        area: "Gwarinpa",
        fee: 1200,
        estimatedTime: "35 - 50 minutes",
        active: true,
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_zone_gwarinpa`,
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
      where: { id: `${demoPrefix}_automation_hours` },
      update: {
        name: "Opening hours",
        triggers: ["open", "time", "closing"],
        response: "We are open from 9:00 AM to 9:00 PM every day.",
        usedCount: 8,
        status: "ACTIVE",
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_automation_hours`,
        restaurantId: restaurant.id,
        name: "Opening hours",
        triggers: ["open", "time", "closing"],
        response: "We are open from 9:00 AM to 9:00 PM every day.",
        usedCount: 8,
        isDemo: true,
      },
    }),
    prisma.automation.upsert({
      where: { id: `${demoPrefix}_automation_payment` },
      update: {
        name: "Payment options",
        triggers: ["pay", "payment", "transfer"],
        response: "You can pay by transfer, card, or cash on delivery.",
        usedCount: 5,
        status: "ACTIVE",
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_automation_payment`,
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

  await Promise.all([
    prisma.message.upsert({
      where: { id: `${demoPrefix}_message_menu_request` },
      update: {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: "Please send menu",
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_message_menu_request`,
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: "Please send menu",
        isDemo: true,
      },
    }),
    prisma.message.upsert({
      where: { id: `${demoPrefix}_message_menu_reply` },
      update: {
        conversationId: conversation.id,
        senderType: "BOT",
        content:
          "Hello! Welcome to Mama T's Kitchen.\n\nHere is today's menu:\n\n*Rice*\n- Jollof Rice & Chicken - NGN 3,500",
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_message_menu_reply`,
        conversationId: conversation.id,
        senderType: "BOT",
        content:
          "Hello! Welcome to Mama T's Kitchen.\n\nHere is today's menu:\n\n*Rice*\n- Jollof Rice & Chicken - NGN 3,500",
        isDemo: true,
      },
    }),
    prisma.message.upsert({
      where: { id: `${demoPrefix}_message_order_request` },
      update: {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: "I want Jollof Rice and Chicken",
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_message_order_request`,
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: "I want Jollof Rice and Chicken",
        isDemo: true,
      },
    }),
    prisma.message.upsert({
      where: { id: `${demoPrefix}_message_order_reply` },
      update: {
        conversationId: conversation.id,
        senderType: "BOT",
        content: "Great choice! Please send your delivery address to continue.",
        isDemo: true,
      },
      create: {
        id: `${demoPrefix}_message_order_reply`,
        conversationId: conversation.id,
        senderType: "BOT",
        content: "Great choice! Please send your delivery address to continue.",
        isDemo: true,
      },
    }),
  ]);

  await prisma.order.upsert({
    where: { id: `${demoPrefix}_order_jollof` },
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
      id: `${demoPrefix}_order_jollof`,
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
          id: `${demoPrefix}_order_item_jollof`,
          name: "Jollof Rice & Chicken",
          quantity: 1,
          price: 3500,
          isDemo: true,
        },
      },
    },
  });

  await prisma.orderItem.upsert({
    where: { id: `${demoPrefix}_order_item_jollof` },
    update: {
      name: "Jollof Rice & Chicken",
      quantity: 1,
      price: 3500,
      isDemo: true,
    },
    create: {
      id: `${demoPrefix}_order_item_jollof`,
      orderId: `${demoPrefix}_order_jollof`,
      name: "Jollof Rice & Chicken",
      quantity: 1,
      price: 3500,
      isDemo: true,
    },
  });

  revalidateDemoPaths();

  return { success: "Demo data created successfully." };
}

export async function resetDemoDataForCurrentUser() {
  const restaurant = await getOrCreateCurrentRestaurant();

  if (!restaurant) {
    return { error: "Restaurant not found." };
  }

  await resetDemoDataForRestaurant(restaurant.id);
  revalidateDemoPaths();

  return { success: "Demo data reset successfully." };
}
