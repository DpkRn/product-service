#stop container
docker stop product-service

#remove container
docker rm product-service

#rerun container
docker run -d \
  --name product-service \
  --network app-net \
  -e DB_HOST=postgres \
  -e DB_USER=myuser \
  -e DB_PASSWORD=mypassword \
  -e DB_NAME=mydb \
  -p 5001:5001 \
  product-service