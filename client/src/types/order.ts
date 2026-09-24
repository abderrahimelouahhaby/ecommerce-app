export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export type Order = {
  id: string;
  userId: string;
  status: string;
  total: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

/** The order shape the admin API returns, with the customer + next steps. */
export type AdminOrder = Order & {
  user: { id: string; firstName: string; lastName: string; email: string };
  nextStatuses: string[];
};
