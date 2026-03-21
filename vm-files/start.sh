#!/bin/bash
cd /home/osboxes/Desktop/globe-scholars
docker compose up --build -d
sleep 60
echo "==============================="
echo "Globe Scholars is running!"
echo "Open browser: http://localhost:4200"
echo "==============================="
xdg-open http://localhost:4200
