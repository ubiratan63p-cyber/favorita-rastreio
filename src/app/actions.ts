'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createOrder(data: {
  customerName: string;
  customerCpf: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  products: { name: string; quantity: number }[];
}) {
  const trackingCode = `FAV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      trackingCode,
      customerName: data.customerName,
      customerCpf: data.customerCpf,
      street: data.street,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zip: data.zip,
      products: {
        create: data.products,
      },
    },
  });

  revalidatePath('/admin');
  return { success: true, trackingCode: order.trackingCode };
}

export async function getOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { products: true },
  });
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({
    where: { id },
  });
  revalidatePath('/admin');
}

export async function getOrderTracking(trackingCode: string) {
  return await prisma.order.findUnique({
    where: { trackingCode },
    include: { products: true },
  });
}
