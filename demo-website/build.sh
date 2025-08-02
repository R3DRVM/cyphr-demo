#!/bin/bash

echo "Building Cyphr app..."
cd cyphr-app
npm run build
cd ..

echo "Copying built files to root directory..."
cp -r cyphr-app/dist/* .
cp cyphr-app/public/* .

echo "Build complete! Files are ready for deployment."
