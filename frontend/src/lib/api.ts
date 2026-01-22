import { Order, OrderResult, OrderUpdate, ScanningUpdate, ScanResult } from "@/types/order";

const BACKEND_URL = 'http://localhost:5000/api/v1/';

export const merchantOrderAPI = {
  getOrder: async (orderId: string): Promise<Order> => {
    
    const endpoint = `${BACKEND_URL}merchant/get-order/?orderId=${orderId}`;

    try {
      console.log(`Token Params from QR scan: ${orderId}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok){
        if (response.status === 404) {
            const result: Order = {
                success: false,
                orderId: orderId
            }
            return result
        } else {
            const errorDetail = await response.text();
            throw new Error(`Failed to fetch order. Status: ${response.status}. Detail: ${errorDetail}`);
        }
      }
      
      const res = await response.json();
      const orderDetails = res.orderDetails[0]
      console.log(orderDetails)
      const result: Order = {
        success: res.success,
        orderId: orderDetails.orderId,
        merchantName: orderDetails.merchantName,
        customerName: orderDetails.customerName,
        customerPhone: orderDetails.customerPhone,
        customerAddress: orderDetails.customerAddress,
        items: orderDetails.items,
        status: orderDetails.status,
        createdAt: orderDetails.localtime,
        deliveryLocation: orderDetails.customerAddress,
        estimatedDelivery: orderDetails.estimatedDelivery,
        notes: orderDetails.notes
      };
      return result;

    } catch (error) {
      console.error("API Call Error in merchantOrderAPI.getOrder:", error);
      throw error;
    }
  },

  createOrder: async (order:Order): Promise<OrderResult> => {
    
    const endpoint = `${BACKEND_URL}merchant/create-order`;

    try {
      console.log(`Token Params from QR scan: ${order.orderId}`);
     
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
    if (!response.ok){
        const errorDetail = await response.text();
        throw new Error(`Failed to create order. Status: ${response.status}. Detail: ${errorDetail}`);
    } else {
        const result: OrderResult = {
            success: true,
            message: "Order created successfully"
        }
        return result
    }

    } catch (error) {
      console.error("API Call Error in merchantOrderAPI.createOrder:", error);
      throw error;
    }
  },

  updateOrder: async (order:OrderUpdate): Promise<OrderResult> => {
    
    const endpoint = `${BACKEND_URL}merchant/update-order`;

    try {
      console.log(`Token Params from QR scan: ${order.orderId}`);
      const payload = {
        "orderId": order.orderId,
        "updateData": {
          "status": order.status
        }
      }
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
    if (!response.ok){
        const errorDetail = await response.text();
        throw new Error(`Failed to update order. Status: ${response.status}. Detail: ${errorDetail}`);
    } else {
        const result: OrderResult = {
            success: true,
            message: "Order updated successfully"
        }
        return result
    }

    } catch (error) {
      console.error("API Call Error in merchantOrderAPI.updateOrder:", error);
      throw error;
    }
  },
};

export const scanAPI = {
  insertScan: async (scan:ScanningUpdate): Promise<OrderResult> => {
    console.log(scan)
    const endpoint = `${BACKEND_URL}scan/create-scan`;

    try {
      console.log(`Token Params from QR scan: ${scan.orderId}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scan),
      });
      
    if (!response.ok){
        const errorDetail = await response.text();
        throw new Error(`Failed to save delivery status. Status: ${response.status}. Detail: ${errorDetail}`);
    } else {
        const result: OrderResult = {
            success: true,
            message: "Scan successfully saved"
        }
        return result
    }

    } catch (error) {
      console.error("API Call Error in scanAPI.insertScan:", error);
      throw error;
    }
  },

  getScans: async (orderId: string, date: string): Promise<ScanResult> => {
    
    const endpoint = `${BACKEND_URL}scan/get-scans/?orderId=${orderId}&date=${date}`;

    try {
      console.log(`Fetching scans for order: ${orderId}, ${date}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok){
        if (response.status === 404) {
            const result: ScanResult = {
                success: false,
                message: "Tracking details not found for this order",
                scanDetails: null
            }
          return result
        } else {
            const errorDetail = await response.text();
            throw new Error(`Failed to fetch scans. Status: ${response.status}. Detail: ${errorDetail}`);
        }
      }
  
      const res = await response.json();
      
      console.log(res)
      const result: ScanResult = {
        success: res.success,
        message: res.message,
        scanDetails: res.scanDetails
      };
      return result;

    } catch (error) {
      console.error("API Call Error in scanAPI.getScans:", error);
      throw error;
    }
  }
};
