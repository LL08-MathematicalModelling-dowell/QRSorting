import { Order, OrderResult, OrderUpdate, ScanningUpdate, ScanResult } from "@/types/order";

const BACKEND_URL = '/api/v1';

export const merchantOrderAPI = {
  getOrder: async (orderId: string): Promise<Order> => {
    console.log(`Fetching order: ${orderId}`);
    const endpoint = `${BACKEND_URL}/merchant/get-order/?orderId=${orderId}`;

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
        notes: orderDetails.notes,
        audioBuffer: orderDetails.audioBuffer,
        imageBuffer: orderDetails.imageBuffer,
        audioType: orderDetails.audioType,
        imageType: orderDetails.imageType
      };
      return result;

    } catch (error) {
      console.error("API Call Error in merchantOrderAPI.getOrder:", error);
      throw error;
    }
  },

  createOrder: async (order:Order): Promise<OrderResult> => {
    console.log("This is the order:", order)
    const endpoint = `${BACKEND_URL}/merchant/create-order`;

    // Helper function to convert Blob to base64 buffer string
    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    try {
      console.log(`Token Params from QR scan: ${order.orderId}`);
      
      // Convert blobs to base64 buffers if present
      let imageBuffer: string | null = null;
      let audioBuffer: string | null = null;
      let imageURL: string | null = null;
      let audioURL: string | null = null;
      
      if (order.imageBlob) {
        imageBuffer = await blobToBase64(order.imageBlob);
        imageURL = URL.createObjectURL(order.imageBlob);
      }
      
      if (order.audioBlob) {
        audioBuffer = await blobToBase64(order.audioBlob);
        audioURL = URL.createObjectURL(order.audioBlob);
      }
      
      // Build order payload with buffer data
      const orderPayload = {
        ...order,
        imageBuffer: imageBuffer,
        imageType: order.imageBlob?.type || null,
        audioBuffer: audioBuffer,
        audioType: order.audioBlob?.type || null,
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
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
    
    const endpoint = `${BACKEND_URL}/merchant/update-order`;

    try {
      console.log(`Token Params from QR scan: ${order.orderId}`);
      const payload = {
        "orderId": order.orderId,
        "updateData": {
          "status": order.status,
          "estimatedDelivery": order.estimatedDelivery
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
    const endpoint = `${BACKEND_URL}/scan/create-scan`;

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
    
    const endpoint = `${BACKEND_URL}/scan/get-scans/?orderId=${orderId}&date=${date}`;

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
