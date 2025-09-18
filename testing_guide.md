
# Testing Guide - FoodFast Backend Project

## Feature 1: Account Management
- Register a new user: POST `/api/auth/register`
- Login: POST `/api/auth/login`
- Update profile: PUT `/api/users/:id`
- Verify immediate response and database update

## Feature 2: Order Tracking
- Place an order: POST `/api/orders`
- Track order: GET `/api/orders/:orderId/status`
- Ensure long polling updates status every 30–120s

## Feature 3: Driver Location
- Use test page or API to simulate driver location updates
- Confirm WebSocket sends updates every 10–15s
- Only the relevant customer receives updates

## Feature 4: Restaurant Notifications
- Place an order
- Ensure restaurant dashboard receives WebSocket notifications immediately
- Test multiple restaurant users logged in

## Feature 5: Customer Support Chat
- Open chat as customer and agent
- Send messages both ways
- Check typing indicators and delivery confirmations

## Feature 6: System-Wide Announcements
- Send announcement via admin endpoint
- Verify broadcast to all connected users via WebSocket namespace

## Feature 7: Image Upload
- Upload image via `/api/products`
- Confirm upload progress and Cloudinary processing
- Check Redis cache invalidation after upload
