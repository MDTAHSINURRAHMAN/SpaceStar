export interface Order {
    _id: string;
    customerName: string;
    customerEmail: string;
    customerNumber: string;
    customerAddress: string;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  