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
