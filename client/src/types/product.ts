export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};