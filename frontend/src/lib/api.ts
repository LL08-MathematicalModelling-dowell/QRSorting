import { Order, OrderResult, OrderUpdate, ScanningUpdate, ScanResult, FileDownloadResult } from "@/types/order";

const BACKEND_URL = '/api/v1';
export const adminAPI = {
  verifyMerchant: async (phoneNumber: string): Promise<{ success: boolean; message?: string, merchantDetails?: any }> => {
    const endpoint = `${BACKEND_URL}/admin/verify/?phoneNumber=${phoneNumber}`;

    try {
      console.log('Verifying merchant phone:', phoneNumber);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        return {
          success: false,
          message: `Verification failed: ${errorDetail}`,
        };
      }

      const res = await response.json();
      console.log("This is the response:", res);
      return res;
    } catch (error) {
      console.error('API Call Error in adminAPI.verifyMerchant:', error);
      return {
        success: false,
        message: 'Network error during verification',
      };
    }
  },

  registerMerchant: async (data: { businessName: string; phoneNumber: string; address: string }): Promise<{ success: boolean; message?: string }> => {
    const endpoint = `${BACKEND_URL}/admin/register`;

    try {
      console.log('Registering merchant:', data.businessName);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        return {
          success: false,
          message: `Registration failed: ${errorDetail}`,
        };
      }

      const res = await response.json();
      return {
        success: res.success,
        message: res.message,
      };
    } catch (error) {
      console.error('API Call Error in adminAPI.registerMerchant:', error);
      return {
        success: false,
        message: 'Network error during registration',
      };
    }
  },
}
export const merchantOrderAPI = {
  decryptToken: async (encryptedId: string): Promise<{ success: boolean; message?: string, decryptedId?: any }> => {
    const endpoint = `${BACKEND_URL}/admin/decrypt`;

    try {
      console.log('Decrypting token...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: encryptedId }),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        return {
          success: false,
          message: `Decryption failed: ${errorDetail}`,
        };
      }

      const res = await response.json();
      return {
        success: res.success,
        message: res.message,
        decryptedId: res.payload

      };
    } catch (error) {
      console.error('API Call Error in merchantOrderAPI.decryptOrderId:', error);
      return {
        success: false,
        message: 'Network error during decryption',
      };
    }
  },
  getOrder: async (orderId: string): Promise<Order> => {
    console.log(`Fetching order...`);
    const endpoint = `${BACKEND_URL}/merchant/get-order/?orderId=${orderId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
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
      // console.log(orderDetails)
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
        audioFileId: orderDetails.audioFileId,
        imageFileId: orderDetails.imageFileId,
        audioType: orderDetails.audioType,
        imageType: orderDetails.imageType
      };
      return result;

    } catch (error) {
      console.error("API Call Error in merchantOrderAPI.getOrder:", error);
      throw error;
    }
  },
  
  getMediaFiles: async (fileId: string): Promise<FileDownloadResult> => {
    const endpoint = `${BACKEND_URL}/merchant/download/?fileId=${fileId}`;

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Failed to download file. Status: ${response.status}. Detail: ${errorDetail}`);
      }
      const res = await response.json();
      // console.log("File download response:", res);
      return res;

    } catch (error) {
      console.error("API Call Error in merchantOrderAPI.getMediaFiles:", error.message);
      throw error;
    }
  },

  createOrder: async (order: Order): Promise<OrderResult> => {
    // console.log("This is the order:", order)
    const endpoint = `${BACKEND_URL}/merchant/create-order`;
    const fileUploadEndPoint = `${BACKEND_URL}/merchant/upload`

    try {
      console.log(`Token Params from QR scan: ${order.orderId}`);

      let imageFileId: string | null = null;
      let audioFileId: string | null = null;

      if (order.imageBlob) {
        const formData = new FormData();
        formData.append("file", order.imageBlob);
        formData.append("filename", `order-image-${order.orderId}`);

        const uploadResponse = await fetch(fileUploadEndPoint, {
          method: "POST",
          body: formData
        });
        

        if (!uploadResponse.ok) {
          throw new Error(`Image upload failed for order ${order.orderId}`);
        }


        const uploadResult = await uploadResponse.json();
        console.log("Image Upload Result:", uploadResult)
        imageFileId = uploadResult.data.file_id;
      }

      // Upload audio
      if (order.audioBlob) {
        const formData = new FormData();
        formData.append("file", order.audioBlob);
        formData.append("filename", `order-audio-${order.orderId}`);

        const uploadResponse = await fetch(fileUploadEndPoint, {
          method: "POST",
          body: formData
        });

        if (!uploadResponse.ok) {

          throw new Error(`Audio upload failed for order ${order.orderId}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log("Audio Upload Result:", uploadResult)
        audioFileId = uploadResult.data.file_id;
      }

      // Build order payload with buffer data
      delete order.imageBlob
      delete order.audioBlob

      const orderPayload = {
        ...order,
        imageFileId: imageFileId,
        imageType: order.imageBlob?.type || null,
        audioFileId: audioFileId,
        audioType: order.audioBlob?.type || null,
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
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

  updateOrder: async (order: OrderUpdate): Promise<OrderResult> => {

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

      if (!response.ok) {
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
  insertScan: async (scan: ScanningUpdate): Promise<OrderResult> => {
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

      if (!response.ok) {
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

      if (!response.ok) {
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
