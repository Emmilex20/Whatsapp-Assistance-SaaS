import type { OrderStatus } from "@/generated/prisma/client";

export function getOrderNextAction(status: OrderStatus) {
  switch (status) {
    case "NEW":
      return "Review customer details and confirm the order.";
    case "CONFIRMED":
      return "Send order to kitchen or begin preparation.";
    case "PREPARING":
      return "Mark as ready when food is packed.";
    case "READY":
      return "Send out for delivery or notify customer for pickup.";
    case "DELIVERED":
      return "Order completed. No action needed.";
    case "CANCELLED":
      return "Order cancelled. No action needed.";
    default:
      return "Review order.";
  }
}
