import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { GetServerSideProps } from 'next';

// Define an interface for the Order structure based on backend response
interface OrderItem {
  id: number;
  printifyProductId: string;
  printifyVariantId: number;
  quantity: number;
  imageUrl: string;
}

interface UserInfo {
  name?: string | null;
  email?: string | null;
}

interface Order {
  id: number;
  printifyOrderId?: string | null;
  stripePaymentId?: string | null;
  status: string;
  shippingFirstName?: string | null;
  shippingLastName?: string | null;
  shippingEmail?: string | null;
  shippingPhone?: string | null;
  shippingCountry?: string | null;
  shippingRegion?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingZip?: string | null;
  items: OrderItem[];
  user?: UserInfo | null;
  createdAt: string;
  updatedAt: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const orderId = params?.orderId;
  if (!orderId || typeof orderId !== 'string') {
    return { notFound: true };
  }

  try {
    // Ensure environment variables are read correctly
    const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
    // Get the base host URL (e.g., localhost OR https://chaosstickers-backend-production.up.railway.app)
    let backendBaseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${backendPort}`;

    // Remove potential trailing slash from base URL
    if (backendBaseUrl.endsWith('/')) {
      backendBaseUrl = backendBaseUrl.slice(0, -1);
    }

    // Construct the final URL, ensuring no double slashes
    const fullApiUrl = `${backendBaseUrl}/api/orders/${orderId}`;

    console.log(`[getServerSideProps] Fetching order from: ${fullApiUrl}`);
    const response = await fetch(fullApiUrl);

    if (!response.ok) {
      let errorData = { error: `Failed to fetch order: ${response.statusText}` };
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If response is not JSON, use the status text
        console.error("Could not parse error response as JSON:", jsonError);
      }
      console.error(`[getServerSideProps] Error fetching order ${orderId}:`, response.status, errorData);
      throw new Error(errorData.error || `Failed to fetch order: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[getServerSideProps] Successfully fetched order ${orderId}`);
    return { props: { order: data.order } }; // Ensure backend returns { order: ... }

  } catch (error: any) {
    console.error(`[getServerSideProps] Catch block error for order ${orderId}:`, error);
    // Return notFound true to render a 404 page
    // Avoid returning the error directly to the client props for security
    return { notFound: true };
  }
};

const OrderDetailsPage = ({ order }: { order: Order }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
       return new Date(dateString).toLocaleString();
    } catch (e) {
       return dateString; // Return original string if parsing fails
    }
  };

  return (
    <>
      <Head>
        <title>Order #{order.id} Details - Chaos Stickers</title>
      </Head>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h4" gutterBottom>
            Order Details #{order.id}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Order Summary */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Order ID" secondary={order.id} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Status" secondary={order.status} sx={{ textTransform: 'capitalize' }} />
                </ListItem>
                 <ListItem>
                  <ListItemText primary="Printify Order ID" secondary={order.printifyOrderId || 'N/A'} />
                </ListItem>
                 <ListItem>
                  <ListItemText primary="Stripe Payment ID" secondary={order.stripePaymentId || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Order Date" secondary={formatDate(order.createdAt)} />
                </ListItem>
                 <ListItem>
                  <ListItemText primary="Last Updated" secondary={formatDate(order.updatedAt)} />
                </ListItem>
                 {order.user && (
                   <>
                     <ListItem>
                       <ListItemText primary="Customer Name" secondary={order.user.name || 'N/A'} />
                     </ListItem>
                     <ListItem>
                       <ListItemText primary="Customer Email" secondary={order.user.email || 'N/A'} />
                     </ListItem>
                   </>
                 )}
              </List>
            </Box>

            {/* Shipping Address */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Shipping Address</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Name" secondary={`${order.shippingFirstName || ''} ${order.shippingLastName || ''}`.trim() || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Email" secondary={order.shippingEmail || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Phone" secondary={order.shippingPhone || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Address" secondary={`${order.shippingAddress1 || ''}${order.shippingAddress2 ? ', ' + order.shippingAddress2 : ''}`.trim() || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="City" secondary={order.shippingCity || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Region/State" secondary={order.shippingRegion || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="ZIP/Postal Code" secondary={order.shippingZip || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Country" secondary={order.shippingCountry || 'N/A'} />
                </ListItem>
              </List>
            </Box>
          </Box>

          {/* Order Items */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Items</Typography>
            <List>
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <ListItem key={item.id} divider sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                       <Box sx={{ width: 80, height: 80, mr: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <img 
                           src={item.imageUrl}
                           alt={`Sticker for order ${order.id}`}
                           style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                           onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }} // Optional: fallback image
                         />
                       </Box>
                       <ListItemText
                         primary={`Sticker`}
                         secondary={`Quantity: ${item.quantity}`}
                       />
                       <Box sx={{ textAlign: 'right', ml: 2 }}>
                         <Typography variant="body2">Product ID: {item.printifyProductId}</Typography>
                         <Typography variant="body2">Variant ID: {item.printifyVariantId}</Typography>
                       </Box>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No items found for this order." />
                </ListItem>
              )}
            </List>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default OrderDetailsPage; 