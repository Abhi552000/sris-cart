export interface Product {
  _id: string;
  name: string;
  category: string;
  description: string[];
  price: number;
  offerPrice: number;
  image: string[];
  inStock: boolean;
  bestseller: boolean;
  createdAt?: string;
  quantity?: number; // optional, when resolved inside cart
}

export interface User {
  _id: string;
  name: string;
  email: string;
  cartItems: Record<string, number>;
}

export interface Seller {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Address {
  _id?: string;
  fullName?: string;
  addressLine?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  street?: string;
  city: string;
  state: string;
  zipCode?: string;
  zipcode?: string;
  country?: string;
  phone: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: Array<{
    product: Product | string | null;
    quantity: number;
    price: number;
  }>;
  amount: number;
  address: Address | string | null;
  status: string;
  paymentMethod: string;
  payment: boolean;
  date: number | string;
  couponCode?: string;
  discountAmount?: number;
}
