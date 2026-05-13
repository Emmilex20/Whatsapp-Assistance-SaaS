import type { OrderStatus } from "@/generated/prisma/client";

export function getOrderStatusMessage({
  status,
  restaurantName,
  orderCode,
}: {
  status: OrderStatus;
  restaurantName: string;
  orderCode: string;
}) {
  switch (status) {
    case "CONFIRMED":
      return `Good news. Your order #${orderCode} from ${restaurantName} has been confirmed. We will begin processing it shortly.`;
    case "PREPARING":
      return `Your order #${orderCode} is now being prepared. We will update you when it is ready.`;
    case "READY":
      return `Your order #${orderCode} is ready. It will be sent out for delivery or prepared for pickup shortly.`;
    case "DELIVERED":
      return `Your order #${orderCode} has been marked as delivered. Thank you for ordering from ${restaurantName}.`;
    case "CANCELLED":
      return `Your order #${orderCode} has been cancelled. Please contact us if you need help placing another order.`;
    default:
      return `Your order #${orderCode} has been updated.`;
  }
}
