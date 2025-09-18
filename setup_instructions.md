# Setup Instructions - FoodFast Backend Project

## 1. Clone the Project
```bash
git clone <your-repo-url>
cd FoodFastBackend
```
## 2. Install Dependencies
npm install

## 3. Environment Variables
PORT=3000
MONGO_URI=<your-mongodb-uri>
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

## 4.Run Docker (MongoDB + Redis)
docker-compose up -d

## 5.Start the Server
npm run watch


